# 📍 Geo Locator

A production-quality, responsive Angular application that displays the user's real-time browser location on an interactive Leaflet map with OpenStreetMap tiles. Built with modern Angular standalone components, signals, strict TypeScript, and plain SCSS with zero external UI libraries.

---

## 📸 Preview

```
┌────────────────────────────────────────────────────────────────────────┐
│ 📍 Geo Locator                                                    ☀️/🌙│
├────────────────────────────────────────────────────────────────────────┤
│                                                      ┌────────────────┐│
│                                                      │ 📍 My Location ││
│                                                      │ LAT:  37.77493°││
│                                                      │ LNG:-122.41942°││
│                     [ Leaflet Map ]                  │ ACC:   ± 12 m  ││
│                      OpenStreetMap                   │ [📋 Copy]      ││
│                                                      └────────────────┘│
│                                                                        │
│ ┌──────────────────────┐                                               │
│ │ [📍 Locate me]       │                                               │
│ │ [🟢 Track live]      │                                               │
│ └──────────────────────┘                                               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

- **Sensible On-Load Experience**: Loads the map at world view without requesting geolocation automatically, following privacy and permission best practices.
- **High-Accuracy Geolocation**: Calls `navigator.geolocation.getCurrentPosition` with `enableHighAccuracy: true` and a 10-second timeout.
- **Smooth Navigation & Visualization**: Pans/flies smoothly to coordinates (zoom ~16), drops a custom marker with a popup displaying 5-decimal coordinates and accuracy, and renders a dynamic accuracy circle.
- **Live Motion Tracking**: Toggle "Track live" via `navigator.geolocation.watchPosition` to update the marker and accuracy radius as position changes; automatically clears the watch on toggle-off or component destruction.
- **Robust Reactive State Management**: Built purely on Angular Signals (`status`, `position`, `error`, `isTracking`, `isGeolocationSupported`, `isSecureContext`).
- **Comprehensive Error Handling**: Gracefully handles every `GeolocationPositionError` code (`PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, `TIMEOUT`) with friendly guidance and a retry action. Also handles unsupported browsers and insecure contexts.
- **Info & Quick Copy Panel**: Floating panel displaying formatted coordinates and accuracy in meters, with a one-click clipboard copy button and visual confirmation.
- **Light & Dark Theme**: Supports light and dark modes with persistence in `localStorage` (guarded with `try/catch`) and automatic fallback to `prefers-color-scheme`.
- **Accessibility & Contrast**: ARIA labels on all interactive controls, `aria-live` polite status announcer for screen readers, and WCAG-compliant color contrast.
- **Prerender & Node Safe**: Safe execution during build-time prerendering via lazy dynamic Leaflet loading (`import('leaflet')` in `afterNextRender`) and platform browser guards (`isPlatformBrowser`).

---

## 🛠 Tech Stack

- **Framework**: Angular 22 (Standalone Components, Signals, new `@if`/`@else` control flow, OnPush change detection)
- **Mapping**: Leaflet 1.9 & `@types/leaflet` with OpenStreetMap tile layer
- **Language**: TypeScript (strict mode enabled, `strictPropertyInitialization: false` for Leaflet properties)
- **Styling**: Pure SCSS with CSS custom properties (no third-party UI libraries or frameworks)
- **Testing**: Vitest with `@angular/build:unit-test` and mock geolocation harness
- **Formatting**: Prettier

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (recommended: Node.js 22 or 24)
- npm 10+ (or compatible package manager)

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/geo_locator_angular.git
cd geo_locator_angular

# Install dependencies
npm install
```

### Development Server

```bash
# Run local development server
npm start
# or: ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any source files.

### Building for Production

```bash
npm run build
```

The output will be placed in `dist/geo-locator/browser` with prerendered static HTML, client bundles, and copied Leaflet assets.

### Running Unit Tests

```bash
npm test -- --watch=false
```

Executes unit tests using Vitest across all service specs with mocked geolocation APIs.

---

## 🔒 How Geolocation Permissions Work & HTTPS Requirement

1. **Permission States**:
   - **Prompt**: The browser displays a native prompt asking permission to access device location.
   - **Granted**: The app receives position coordinates (`GeolocationPosition`).
   - **Denied**: Triggers error code 1 (`PERMISSION_DENIED`). Users must manually change site permissions in their browser settings (lock icon in address bar) to allow location access.
2. **Secure Contexts (HTTPS)**:
   - Modern browsers (Chrome, Firefox, Safari, Edge) enforce that the Geolocation API is **only accessible in secure contexts** (`https://`) or on `localhost` (loopback address for local development).
   - If accessed over an unencrypted `http://` connection on an external domain, `navigator.geolocation` will be blocked or undefined. Geo Locator detects non-secure contexts and displays a clear advisory alert.

---

## 🗺️ Map Tiles & Attribution

The application uses standard OpenStreetMap (OSM) raster tiles:
- **Tile URL**: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Attribution**: &copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- **Tile Usage Policy**: Tile requests adhere to the [OpenStreetMap Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/). Standard OSM tile servers are community-funded; high-volume production deployments should use dedicated tile services or custom tile caching.

---

## 🌐 Deployment Guide

### Deploy to Vercel (Recommended)

1. Import the repository into [Vercel](https://vercel.com).
2. Vercel automatically detects the project using `vercel.json` and the **Angular** framework preset.
3. Verify settings:
   - **Framework Preset**: `Angular`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/geo-locator/browser`
   - **Node.js Version**: `22.x` (enforced via `package.json` `engines`)
4. Deploy. Vercel provisions HTTPS, which is strictly required for the browser Geolocation API.

### Deploy to Netlify

1. Import the repository in [Netlify](https://www.netlify.com).
2. Configure settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist/geo-locator/browser`
3. Deploy. Ensure HTTPS is enabled (automatically provisioned by Netlify).

---

## 📁 Project Structure

```
geo_locator_angular/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── controls/              # Locate me, Track live, retry controls
│   │   │   │   ├── controls.component.html
│   │   │   │   ├── controls.component.scss
│   │   │   │   └── controls.component.ts
│   │   │   ├── info-panel/            # Coordinates summary & copy button
│   │   │   │   ├── info-panel.component.html
│   │   │   │   ├── info-panel.component.scss
│   │   │   │   └── info-panel.component.ts
│   │   │   ├── map/                   # Leaflet map container & rendering logic
│   │   │   │   ├── map.component.html
│   │   │   │   ├── map.component.scss
│   │   │   │   └── map.component.ts
│   │   │   └── theme-toggle/          # Light/dark theme toggle button
│   │   │       ├── theme-toggle.component.html
│   │   │       ├── theme-toggle.component.scss
│   │   │       └── theme-toggle.component.ts
│   │   ├── services/
│   │   │   ├── location.service.ts    # Geolocation API wrapper & signals
│   │   │   └── location.service.spec.ts # Vitest unit tests
│   │   ├── app.html                   # Root template
│   │   ├── app.scss                   # Root layout styles
│   │   ├── app.ts                     # Root AppComponent
│   │   ├── app.config.ts              # Client application configuration
│   │   ├── app.config.server.ts       # Prerendering server configuration
│   │   └── app.routes.server.ts       # Server routes for prerendering
│   ├── index.html                     # HTML entry point with metadata
│   ├── main.ts                        # Client bootstrap
│   ├── main.server.ts                 # Build-time prerender bootstrap
│   └── styles.scss                    # Global theme tokens, resets & Leaflet overrides
├── public/                            # Static public assets
├── angular.json                       # Angular CLI configuration & Leaflet asset globs
├── package.json                       # Dependencies, engines & scripts
├── vercel.json                        # Vercel deployment configuration
├── tsconfig.json                      # Strict TypeScript compiler options
└── README.md                          # Project documentation
```

---

## 🏷️ GitHub Topics

Suggested repository topics for GitHub:
`angular`, `leaflet`, `geolocation`, `openstreetmap`, `typescript`, `angular-signals`, `standalone-components`, `vitest`

---

## 📄 Licence

This project is licensed under the [MIT License](LICENSE).
