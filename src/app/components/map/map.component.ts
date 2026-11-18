import {
  Component,
  OnDestroy,
  inject,
  effect,
  afterNextRender,
  ChangeDetectionStrategy,
} from '@angular/core';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MapComponent implements OnDestroy {
  private locationService = inject(LocationService);
  private map: any = null; // typed as any until Leaflet is imported
  private marker: any = null;
  private circle: any = null;
  private L: any = null; // Leaflet module reference

  constructor() {
    // Load Leaflet lazily after first render (avoids SSR window access)
    afterNextRender(async () => {
      this.L = await import('leaflet');
      this.initMap();
    });

    // React to position changes via effect
    effect(() => {
      const position = this.locationService.position();
      if (position && this.map && this.L) {
        this.updateMapPosition(position);
      }
    });
  }

  private initMap(): void {
    const L = this.L;

    // Fix default marker icon URLs
    L.Icon.Default.mergeOptions({
      iconUrl: '/assets/leaflet-images/marker-icon.png',
      iconRetinaUrl: '/assets/leaflet-images/marker-icon-2x.png',
      shadowUrl: '/assets/leaflet-images/marker-shadow.png',
    });

    this.map = L.map('map', {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.map.invalidateSize();

    // Invalidate on window resize
    window.addEventListener('resize', this.onResize);
  }

  private onResize = (): void => {
    this.map?.invalidateSize();
  };

  private updateMapPosition(position: GeolocationPosition): void {
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

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
