import { Component, OnInit, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { MapComponent } from './components/map/map.component';
import { ControlsComponent } from './components/controls/controls.component';
import { InfoPanelComponent } from './components/info-panel/info-panel.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
  imports: [MapComponent, ControlsComponent, InfoPanelComponent, ThemeToggleComponent],
})
export class AppComponent implements OnInit {
  private title = inject(Title);
  private meta = inject(Meta);

  ngOnInit(): void {
    this.title.setTitle('Geo Locator – Find Your Location on the Map');
    this.meta.addTag({
      name: 'description',
      content:
        'Geo Locator: an interactive map app that shows your current browser location using the Geolocation API and Leaflet / OpenStreetMap.',
    });
  }
}
