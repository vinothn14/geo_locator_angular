import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { LocationService, friendlyErrorMessage } from '../../services/location.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ControlsComponent {
  protected locationService = inject(LocationService);
  protected friendlyErrorMessage = friendlyErrorMessage;

  protected get isLocating() {
    return this.locationService.status() === 'locating';
  }
  protected get isSuccess() {
    return this.locationService.status() === 'success';
  }
  protected get isError() {
    return this.locationService.status() === 'error';
  }
  protected get isIdle() {
    return this.locationService.status() === 'idle';
  }

  protected onLocateMe(): void {
    this.locationService.getCurrentPosition();
  }

  protected onToggleTracking(): void {
    if (this.locationService.isTracking()) {
      this.locationService.stopTracking();
    } else {
      this.locationService.startTracking();
    }
  }

  protected onRetry(): void {
    this.locationService.clearError();
    this.locationService.getCurrentPosition();
  }
}
