import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrl: './info-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class InfoPanelComponent {
  protected locationService = inject(LocationService);
  protected copied = signal(false);

  protected get coords() {
    const pos = this.locationService.position();
    if (!pos) return null;
    return {
      lat: pos.coords.latitude.toFixed(5),
      lng: pos.coords.longitude.toFixed(5),
      accuracy: Math.round(pos.coords.accuracy),
    };
  }

  protected async copyCoordinates(): Promise<void> {
    const c = this.coords;
    if (!c) return;
    try {
      await navigator.clipboard.writeText(`${c.lat}, ${c.lng}`);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      // fallback: ignore
    }
  }
}
