import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { LocationService, friendlyErrorMessage } from './location.service';

describe('LocationService', () => {
  let service: LocationService;
  let mockGeolocation: {
    getCurrentPosition: ReturnType<typeof vi.fn>;
    watchPosition: ReturnType<typeof vi.fn>;
    clearWatch: ReturnType<typeof vi.fn>;
  };
  const originalGeolocation = typeof navigator !== 'undefined' ? navigator.geolocation : undefined;

  function setupService(platformId: string = 'browser') {
    TestBed.configureTestingModule({
      providers: [LocationService, { provide: PLATFORM_ID, useValue: platformId }],
    });
    service = TestBed.inject(LocationService);
  }

  beforeEach(() => {
    mockGeolocation = {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    };

    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
      writable: true,
    });

    setupService('browser');
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    Object.defineProperty(navigator, 'geolocation', {
      value: originalGeolocation,
      configurable: true,
      writable: true,
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.status()).toBe('idle');
    expect(service.position()).toBeNull();
    expect(service.error()).toBeNull();
    expect(service.isTracking()).toBe(false);
  });

  it('should report geolocation as unsupported when navigator.geolocation is undefined', () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    TestBed.resetTestingModule();
    setupService('browser');
    expect(service.isGeolocationSupported()).toBe(false);
  });

  it('should report geolocation as unsupported in SSR (server platform)', () => {
    TestBed.resetTestingModule();
    setupService('server');
    expect(service.isGeolocationSupported()).toBe(false);
  });

  it('should set status to locating then success on getCurrentPosition success', () => {
    const fakePosition = {
      coords: {
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        toJSON: () => ({}),
      },
      timestamp: Date.now(),
      toJSON: () => ({}),
    } as unknown as GeolocationPosition;

    mockGeolocation.getCurrentPosition.mockImplementation((successCb: PositionCallback) => {
      successCb(fakePosition);
    });

    service.getCurrentPosition();

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    expect(service.status()).toBe('success');
    expect(service.position()).toBe(fakePosition);
    expect(service.error()).toBeNull();
  });

  it('should set status to error on PERMISSION_DENIED (code 1)', () => {
    const fakeError = {
      code: 1,
      message: 'User denied geolocation prompt',
    } as GeolocationPositionError;

    mockGeolocation.getCurrentPosition.mockImplementation(
      (_: PositionCallback, errorCb?: PositionErrorCallback | null) => {
        errorCb!(fakeError);
      },
    );

    service.getCurrentPosition();

    expect(service.status()).toBe('error');
    expect(service.error()?.code).toBe(1);
  });

  it('should set status to error on POSITION_UNAVAILABLE (code 2)', () => {
    const fakeError = {
      code: 2,
      message: 'Position unavailable',
    } as GeolocationPositionError;

    mockGeolocation.getCurrentPosition.mockImplementation(
      (_: PositionCallback, errorCb?: PositionErrorCallback | null) => {
        errorCb!(fakeError);
      },
    );

    service.getCurrentPosition();

    expect(service.status()).toBe('error');
    expect(service.error()?.code).toBe(2);
  });

  it('should set status to error on TIMEOUT (code 3)', () => {
    const fakeError = {
      code: 3,
      message: 'Location request timed out',
    } as GeolocationPositionError;

    mockGeolocation.getCurrentPosition.mockImplementation(
      (_: PositionCallback, errorCb?: PositionErrorCallback | null) => {
        errorCb!(fakeError);
      },
    );

    service.getCurrentPosition();

    expect(service.status()).toBe('error');
    expect(service.error()?.code).toBe(3);
  });

  it('should start tracking with watchPosition and update position signal', () => {
    const fakePosition = {
      coords: { latitude: 40.7128, longitude: -74.006, accuracy: 15 },
    } as unknown as GeolocationPosition;

    mockGeolocation.watchPosition.mockImplementation((successCb: PositionCallback) => {
      successCb(fakePosition);
      return 123;
    });

    service.startTracking();

    expect(mockGeolocation.watchPosition).toHaveBeenCalled();
    expect(service.isTracking()).toBe(true);
    expect(service.status()).toBe('success');
    expect(service.position()).toBe(fakePosition);
  });

  it('should stop tracking and clear watch when stopTracking is called', () => {
    mockGeolocation.watchPosition.mockReturnValue(456);

    service.startTracking();
    expect(service.isTracking()).toBe(true);

    service.stopTracking();
    expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(456);
    expect(service.isTracking()).toBe(false);
  });

  it('should clear error and reset status to idle on clearError', () => {
    const fakeError = { code: 1, message: 'Denied' } as GeolocationPositionError;
    mockGeolocation.getCurrentPosition.mockImplementation(
      (_: PositionCallback, errorCb?: PositionErrorCallback | null) => {
        errorCb!(fakeError);
      },
    );

    service.getCurrentPosition();
    expect(service.status()).toBe('error');
    expect(service.error()).not.toBeNull();

    service.clearError();
    expect(service.status()).toBe('idle');
    expect(service.error()).toBeNull();
  });

  describe('friendlyErrorMessage', () => {
    it('should return correct string for PERMISSION_DENIED (code 1)', () => {
      const err = { code: 1 } as GeolocationPositionError;
      expect(friendlyErrorMessage(err)).toContain('denied');
    });

    it('should return correct string for POSITION_UNAVAILABLE (code 2)', () => {
      const err = { code: 2 } as GeolocationPositionError;
      expect(friendlyErrorMessage(err)).toContain('unavailable');
    });

    it('should return correct string for TIMEOUT (code 3)', () => {
      const err = { code: 3 } as GeolocationPositionError;
      expect(friendlyErrorMessage(err)).toContain('timed out');
    });

    it('should return unknown error string for unrecognized code', () => {
      const err = { code: 999 } as GeolocationPositionError;
      expect(friendlyErrorMessage(err)).toContain('unknown');
    });
  });
});
