Zwei Tests in `frontend/src/components/LandingPage.test.tsx` sind veraltet und schlagen fehl. Sie wurden bei vorherigen Feature-Changes nicht mitgezogen.

## Aufgaben

- **`should render create session button`**: `getByRole("button", { name: /.../ })` findet zwei Matches, weil der `SectionTitle` (h2) und der `Button` denselben i18n-Text `landing.createSession` = "Create New Session" haben. Query präzisieren (z.B. via `getAllByRole` + Filter, oder eindeutigeren Button-Text-Key `landing.createButton` nutzen).
- **`should call onCreateSession when button clicked`**: Erwartet Signatur `("John Doe")`, aber seit dem Card-Deck-Feature ist die tatsächliche Signatur `("John Doe", "fibonacci")`. Assertion anpassen.

## Betroffene Services

- frontend

## Quelle

Aufgefallen bei der Bearbeitung von Issue #002.
