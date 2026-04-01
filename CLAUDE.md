# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**RedIng** is a single-file React component (`ComunidadUDP.js`) that implements a professional network directory for engineers (Red de Ingenieros - UDP). It is designed to be embedded as a widget inside a host platform that provides a `window.storage` API.

## Architecture

Everything lives in one file — `ComunidadUDP.js` — exported as `default function RedIng`. There is no router, no component files, no CSS files, and no build configuration yet.

### Key concepts

- **Storage**: Data is persisted via `window.storage.get(key, shared)` / `window.storage.set(key, value, shared)` — an API provided by the host platform, not localStorage. Storage key is `SK = "redingv3"`. On first load, if no data exists, `DEMO` seed data is written.
- **Views**: Controlled by `view` state (`"landing"` | `"directory"` | form). A `selected` member object replaces the main view with a profile detail screen. A `done` boolean shows the post-registration success screen.
- **Tabs**: `tab` state (`"directorio"` | `"matching"` | `"admin"`) controls sub-views within the directory view.
- **Matching algorithm**: Iterates all member pairs — checks if keywords from `provider.servicios + provider.capacidades` (words >4 chars) appear in `seeker.necesidades`. Pairs with ≥2 keyword hits are surfaced as opportunities, sorted by score, top 12 shown.
- **Styles**: All styles are inline JS objects. The `S` object holds shared style definitions. The `inp(err)` function returns input styles (highlights red border on error).

### Data model (member object)

```
{ id, fecha, nombre, telefono, correo, empresa, cargo,
  industria, ciudad, linkedin, servicios, clientes,
  necesidades, capacidades, disponibilidad, contactable, comentarios }
```

## Dependencies

- `react` (hooks: `useState`, `useEffect`)
- `xlsx` — for Excel export

No build tool is configured. The component is imported directly by the host platform.

