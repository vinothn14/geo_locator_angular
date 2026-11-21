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
  private markerIcon?: LeafletType.Icon;
  private circle?: LeafletType.Circle;
  private L?: typeof LeafletType;
  private isDestroyed = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.isDestroyed = true;
    });

    // Load Leaflet lazily after first render (avoids SSR window access)
    afterNextRender(async () => {
      const leafletImport: any = await import('leaflet');
      let leaflet = (leafletImport.default ?? leafletImport) as typeof LeafletType;
      if (
        typeof (leaflet as any).icon !== 'function' &&
        typeof (leaflet as any).default?.icon === 'function'
      ) {
        leaflet = (leaflet as any).default;
      }

      if (typeof leaflet.map !== 'function' || typeof leaflet.icon !== 'function') {
        console.error(
          'Failed to load Leaflet: leaflet.map or leaflet.icon is not a function',
          {
            importKeys: Object.keys(leafletImport || {}),
            defaultKeys: leafletImport?.default ? Object.keys(leafletImport.default) : null,
          },
        );
        return;
      }

      if (this.isDestroyed) {
        return;
      }
      this.L = leaflet;
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

    // Create dedicated marker icon
    this.markerIcon = L.icon({
      iconUrl: 'assets/leaflet-images/marker-icon.png',
      iconRetinaUrl: 'assets/leaflet-images/marker-icon-2x.png',
      shadowUrl: 'assets/leaflet-images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });

    const map = L.map('map', {
      center: [20, 0],
      zoom: 2,
      maxZoom: 19,
      zoomControl: true,
    });
    this.map = map;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
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
      this.marker = this.L.marker(latlng, { icon: this.markerIcon })
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
