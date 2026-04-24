Website-Scan vom 2026-04-24 13:17 meldet für die Session-Seite (`/session/:sessionId`):

- `h1` fehlt (serious, SEO)
- `landmark-one-main` fehlt (moderate, Accessibility)
- `page-has-heading-one` (moderate, Accessibility)

Issue #002 hat das Problem auf der LandingPage behoben, die SessionPage hat eine eigene Komponenten-Struktur und blieb davon unberührt.

## Aufgaben

- `<main>` Landmark in `frontend/src/pages/SessionPage.tsx` ergänzen
- `<h1>` ergänzen (sinnvoller Kontext: z.B. "Planning Poker – Session {ID}" oder als visuell dezente H1, die Session-Kontext trägt)
- Regression-Tests analog zu LandingPage (`getByRole('main')`, `getByRole('heading', { level: 1 })`)

## Betroffene Services

- frontend

## Quelle

Website-Scan-Bericht vom 2026-04-24 13:17
