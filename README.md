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
- **SSR & Node Safe**: Safe execution under Angular Server-Side Rendering (SSR) via lazy dynamic Leaflet loading (`import('leaflet')` in `afterNextRender`) and platform browser guards (`isPlatformBrowser`).

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

The output will be placed in `dist/geo-locator` with client bundles and SSR server assets.

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

## 🌐 Deployment Guide

### Deploy to Netlify

1. **Push your code** to a GitHub/GitLab repository.
2. In Netlify, click **Add new site** > **Import an existing project**.
3. Set the build configuration:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/geo-locator/browser`
4. Add a `_redirects` file in `public/_redirects`:
   ```
   /*    /index.html   200
   ```
5. Deploy site. Ensure HTTPS is enabled (automatically provisioned by Netlify).

### Deploy to Vercel

1. Import the repository into Vercel.
2. Select the **Angular** framework preset.
3. Configure settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/geo-locator/browser`
4. Deploy. Vercel automatically issues an SSL certificate for HTTPS.

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
│   │   └── app.config.server.ts       # SSR configuration
│   ├── index.html                     # HTML entry point with metadata
│   ├── main.ts                        # Client bootstrap
│   ├── main.server.ts                 # Server bootstrap
│   ├── server.ts                      # Express SSR server
│   └── styles.scss                    # Global theme tokens, resets & Leaflet overrides
├── public/                            # Static public assets
├── angular.json                       # Angular CLI configuration & Leaflet asset globs
├── package.json                       # Dependencies & scripts
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
