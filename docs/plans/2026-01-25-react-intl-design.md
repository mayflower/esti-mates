# React-Intl Internationalization Design

**Date:** 2026-01-25
**Status:** Approved

## Problem

The application has hardcoded German text throughout the UI. We need a flexible internationalization solution that:
- Supports German and English
- Detects browser language automatically
- Allows manual language switching
- Persists user preference

## Solution

Implement internationalization using **react-intl** (FormatJS) with:
- Browser language detection as default
- Manual language switcher (DE | EN toggle)
- LocalStorage persistence for user preference

## Architecture

### File Structure

```
frontend/src/
├── i18n/
│   ├── IntlProvider.tsx    # Custom wrapper with language logic
│   ├── messages/
│   │   ├── de.json         # German translations
│   │   └── en.json         # English translations
│   └── index.ts            # Exports
├── components/
│   └── LanguageSwitcher.tsx  # DE | EN toggle component
```

### Provider Hierarchy

The IntlProvider wraps the entire app as the outermost provider:

```
AppIntlProvider → BrandingProvider → NotificationProvider → SessionProvider
```

### Language Detection Logic

Priority order:
1. **LocalStorage** - Check `localStorage.getItem('locale')`
2. **Browser language** - Parse `navigator.language` (e.g., "de-DE" → "de")
3. **Fallback** - Default to German if language not supported

## Components

### AppIntlProvider (`i18n/IntlProvider.tsx`)

Custom wrapper that:
- Manages locale state
- Loads appropriate message file
- Provides `useLocale()` hook for language access/switching

### useLocale() Hook

```tsx
const { locale, setLocale } = useLocale();
// locale: 'de' | 'en'
// setLocale: (newLocale: 'de' | 'en') => void
```

`setLocale` automatically persists the choice to LocalStorage.

### LanguageSwitcher Component

- Two buttons side by side: `DE | EN`
- Active language visually highlighted
- Styled with Styled Components to match existing design

Placement: Top area of `LandingPage` and `SessionPage`

## Message Format

Flat JSON structure with namespace prefixes:

```json
{
  "landing.title": "Session erstellen",
  "landing.createButton": "Neue Session starten",
  "landing.joinButton": "Session beitreten",
  "session.participants": "Teilnehmer",
  "session.reveal": "Aufdecken",
  "session.reset": "Zurücksetzen",
  "common.loading": "Laden...",
  "common.error": "Ein Fehler ist aufgetreten"
}
```

## Usage in Components

```tsx
import { FormattedMessage } from 'react-intl';

// Simple usage
<FormattedMessage id="landing.title" />

// With placeholders
<FormattedMessage id="session.participantCount" values={{ count: 5 }} />
```

## Components to Translate

- `LandingPage.tsx` - Form labels, buttons
- `SessionPage.tsx` - Status messages, headings
- `ModeratorControls.tsx` - Button texts
- `ParticipantList.tsx` - Headings
- `ResultsView.tsx` - Result display
- `EstimationCard.tsx` - Card labels
- `Dialog.tsx` / `Toast.tsx` - Notification texts

## Testing

- `IntlProvider.test.tsx` - LocalStorage logic, browser detection, provider rendering
- `LanguageSwitcher.test.tsx` - Language switch interaction

## Dependencies

- `react-intl` - Core i18n library (FormatJS)
