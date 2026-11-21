import { Injectable, signal, computed, inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type LocationStatus = 'idle' | 'locating' | 'success' | 'error';

export function friendlyErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case 1: // GeolocationPositionError.PERMISSION_DENIED
      return 'Location access was denied. Please allow location access in your browser settings and try again.';
    case 2: // GeolocationPositionError.POSITION_UNAVAILABLE
      return 'Your location is currently unavailable. Please check your device settings.';
    case 3: // GeolocationPositionError.TIMEOUT
      return 'Location request timed out. Please check your connection and try again.';
    default:
      return 'An unknown error occurred while retrieving your location.';
  }
}

@Injectable({ providedIn: 'root' })
export class LocationService implements OnDestroy {
  private platformId = inject(PLATFORM_ID);

  readonly status = signal<LocationStatus>('idle');
  readonly position = signal<GeolocationPosition | null>(null);
  readonly error = signal<GeolocationPositionError | null>(null);
  readonly isTracking = signal<boolean>(false);

  readonly isGeolocationSupported = computed(
    () =>
      isPlatformBrowser(this.platformId) &&
      typeof navigator !== 'undefined' &&
      'geolocation' in navigator &&
      !!navigator.geolocation,
  );

  readonly isSecureContext = computed(
    () =>
      isPlatformBrowser(this.platformId) &&
      typeof window !== 'undefined' &&
      !!window.isSecureContext,
  );

  private watchId: number | null = null;

  private readonly positionOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000,
  };

  getCurrentPosition(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.status.set('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.position.set(pos);
        this.status.set('success');
      },
      (err) => {
        this.error.set(err);
        this.status.set('error');
      },
      this.positionOptions,
    );
  }

  startTracking(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.position.set(pos);
        this.status.set('success');
      },
      (err) => {
        this.error.set(err);
        this.status.set('error');
      },
      this.positionOptions,
    );
    this.isTracking.set(true);
  }

  stopTracking(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking.set(false);
  }

  clearError(): void {
    this.error.set(null);
    this.status.set('idle');
  }

  ngOnDestroy(): void {
    this.stopTracking();
  }
}
