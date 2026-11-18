import {
  Component,
  inject,
  effect,
  afterNextRender,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import type * as LeafletType from 'leaflet';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MapComponent {
  private locationService = inject(LocationService);
  private destroyRef = inject(DestroyRef);

  private map?: LeafletType.Map;
  private marker?: LeafletType.Marker;
  private circle?: LeafletType.Circle;
  private L?: typeof LeafletType;
  private isDestroyed = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.isDestroyed = true;
    });

    // Load Leaflet lazily after first render (avoids SSR window access)
    afterNextRender(async () => {
      const leafletModule = await import('leaflet');
      if (this.isDestroyed) {
        return;
      }
      this.L = leafletModule;
      this.initMap();

      // Register resize listener and cleanup strictly in browser context
      const onResize = () => {
        this.map?.invalidateSize();
      };
      window.addEventListener('resize', onResize);

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('resize', onResize);
        if (this.map) {
          this.map.remove();
          this.map = undefined;
        }
      });
    });

    // React to position changes via effect
    effect(() => {
      const position = this.locationService.position();
      if (position && this.map && this.L && !this.isDestroyed) {
        this.updateMapPosition(position);
      }
    });
  }

  private initMap(): void {
    if (!this.L || this.isDestroyed) return;
    const L = this.L;

    // Fix default marker icon URLs
    L.Icon.Default.mergeOptions({
      iconUrl: '/assets/leaflet-images/marker-icon.png',
      iconRetinaUrl: '/assets/leaflet-images/marker-icon-2x.png',
      shadowUrl: '/assets/leaflet-images/marker-shadow.png',
    });

    const map = L.map('map', {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
    });
    this.map = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.invalidateSize();
  }

  private updateMapPosition(position: GeolocationPosition): void {
    if (!this.map || !this.L || this.isDestroyed) return;
    const { latitude, longitude, accuracy } = position.coords;
    const latlng = this.L.latLng(latitude, longitude);

    this.map.flyTo(latlng, 16, { animate: true, duration: 1.5 });

    if (this.marker) {
      this.marker.setLatLng(latlng);
    } else {
      this.marker = this.L.marker(latlng)
        .addTo(this.map)
        .bindPopup(
          `<strong>Your Location</strong><br>
           Lat: ${latitude.toFixed(5)}<br>
           Lng: ${longitude.toFixed(5)}<br>
           Accuracy: ${Math.round(accuracy)} m`,
        )
        .openPopup();
    }

    if (this.circle) {
      this.circle.setLatLng(latlng).setRadius(accuracy);
    } else {
      this.circle = this.L.circle(latlng, {
        radius: accuracy,
        color: '#4f86f7',
        fillColor: '#4f86f780',
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(this.map);
    }
  }
}
