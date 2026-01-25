# React-Intl Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add internationalization (i18n) with react-intl supporting German and English, with browser detection and manual language switching.

**Architecture:** Custom IntlProvider wraps the app, providing locale state and messages. LanguageSwitcher component allows manual switching. LocalStorage persists user preference.

**Tech Stack:** react-intl, React Context, LocalStorage API

---

## Task 1: Install react-intl

**Files:**
- Modify: `frontend/package.json`

**Step 1: Install the dependency**

Run: `cd frontend && npm install react-intl`

**Step 2: Verify installation**

Run: `cd frontend && npm ls react-intl`
Expected: `react-intl@7.x.x` (or similar)

**Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: add react-intl dependency"
```

---

## Task 2: Create German message file

**Files:**
- Create: `frontend/src/i18n/messages/de.json`

**Step 1: Create the German messages file**

```json
{
  "app.connecting": "Verbindung zum Server wird hergestellt...",

  "landing.title": "MF EstiMates",
  "landing.createSession": "Neue Session erstellen",
  "landing.yourName": "Dein Name",
  "landing.createButton": "Neue Session erstellen",
  "landing.or": "oder",
  "landing.joinSession": "Bestehender Session beitreten",
  "landing.sessionIdPlaceholder": "Session-ID (6 Zeichen)",
  "landing.joinButton": "Session beitreten",
  "landing.nameRequired": "Bitte gib deinen Namen ein",
  "landing.sessionIdRequired": "Bitte gib eine Session-ID ein",

  "session.joinTitle": "Session beitreten",
  "session.enterName": "Gib deinen Namen ein",
  "session.joinButton": "Beitreten",
  "session.nameRequired": "Bitte gib deinen Namen ein",
  "session.invalidSessionId": "Ungültige Session-ID",
  "session.sessionIdCopied": "Session-ID in die Zwischenablage kopiert!",
  "session.copyFailed": "Kopieren fehlgeschlagen. Session-ID: {sessionId}",
  "session.clickToCopy": "Klicken zum Kopieren",
  "session.observerMode": "Beobachter-Modus",
  "session.participantMode": "Teilnehmer-Modus",
  "session.switchToParticipant": "Zu Teilnehmer-Modus wechseln",
  "session.switchToObserver": "Zu Beobachter-Modus wechseln",

  "moderator.revealCards": "Karten aufdecken",
  "moderator.revealAriaLabel": "Alle Teilnehmerkarten aufdecken",
  "moderator.revealWaiting": "Karten aufdecken (warte auf Schätzungen)",
  "moderator.newRound": "Neue Runde",
  "moderator.newRoundAriaLabel": "Neue Schätzrunde starten",

  "participants.title": "Teilnehmer ({count})",
  "participants.regionLabel": "Session-Teilnehmer",
  "participants.moderatorLabel": "Session-Moderator",
  "participants.observerLabel": "Beobachter (stimmt nicht ab)",
  "participants.observer": "Beobachter",
  "participants.makeParticipant": "Zum Teilnehmer machen",
  "participants.makeObserver": "Zum Beobachter machen",
  "participants.transferModerator": "Moderator-Rolle übertragen",
  "participants.statusObserver": "Beobachter",
  "participants.statusVoted": "Hat abgestimmt",
  "participants.statusVotedValue": "Stimme: {value}",
  "participants.statusWaiting": "Wartet auf Abstimmung",

  "results.title": "Ergebnis",
  "results.regionLabel": "Abstimmungsergebnis",
  "results.noVotes": "Noch keine Stimmen",
  "results.averageLabel": "Durchschnittliche Schätzung: {value} Story Points",
  "results.voteCount": "{count, plural, one {# Stimme} other {# Stimmen}}",

  "dialog.error": "Fehler",
  "dialog.info": "Information",
  "dialog.ok": "OK",

  "toast.closeLabel": "Benachrichtigung schließen",

  "estimation.observerMessage": "Du bist im Beobachter-Modus und kannst nicht schätzen",

  "language.de": "DE",
  "language.en": "EN"
}
```

**Step 2: Commit**

```bash
git add frontend/src/i18n/messages/de.json
git commit -m "feat(i18n): add German translations"
```

---

## Task 3: Create English message file

**Files:**
- Create: `frontend/src/i18n/messages/en.json`

**Step 1: Create the English messages file**

```json
{
  "app.connecting": "Connecting to server...",

  "landing.title": "MF EstiMates",
  "landing.createSession": "Create New Session",
  "landing.yourName": "Your name",
  "landing.createButton": "Create New Session",
  "landing.or": "or",
  "landing.joinSession": "Join Existing Session",
  "landing.sessionIdPlaceholder": "Session ID (6 characters)",
  "landing.joinButton": "Join Existing Session",
  "landing.nameRequired": "Please enter your name",
  "landing.sessionIdRequired": "Please enter a session ID",

  "session.joinTitle": "Join Session",
  "session.enterName": "Enter your name",
  "session.joinButton": "Join",
  "session.nameRequired": "Please enter your name",
  "session.invalidSessionId": "Invalid session ID",
  "session.sessionIdCopied": "Session ID copied to clipboard!",
  "session.copyFailed": "Failed to copy. Session ID: {sessionId}",
  "session.clickToCopy": "Click to copy",
  "session.observerMode": "Observer Mode",
  "session.participantMode": "Participant Mode",
  "session.switchToParticipant": "Switch to Participant mode",
  "session.switchToObserver": "Switch to Observer mode",

  "moderator.revealCards": "Reveal Cards",
  "moderator.revealAriaLabel": "Reveal all participant cards",
  "moderator.revealWaiting": "Reveal cards (waiting for estimates)",
  "moderator.newRound": "New Round",
  "moderator.newRoundAriaLabel": "Start a new estimation round",

  "participants.title": "Participants ({count})",
  "participants.regionLabel": "Session participants",
  "participants.moderatorLabel": "Session moderator",
  "participants.observerLabel": "Observer (not voting)",
  "participants.observer": "Observer",
  "participants.makeParticipant": "Make Participant",
  "participants.makeObserver": "Make Observer",
  "participants.transferModerator": "Transfer Moderator Role",
  "participants.statusObserver": "Observer",
  "participants.statusVoted": "Voted",
  "participants.statusVotedValue": "Voted: {value}",
  "participants.statusWaiting": "Waiting for vote",

  "results.title": "Results",
  "results.regionLabel": "Voting results",
  "results.noVotes": "No votes yet",
  "results.averageLabel": "Average estimate: {value} story points",
  "results.voteCount": "{count, plural, one {# vote} other {# votes}}",

  "dialog.error": "Error",
  "dialog.info": "Information",
  "dialog.ok": "OK",

  "toast.closeLabel": "Close notification",

  "estimation.observerMessage": "You are in observer mode and cannot estimate",

  "language.de": "DE",
  "language.en": "EN"
}
```

**Step 2: Commit**

```bash
git add frontend/src/i18n/messages/en.json
git commit -m "feat(i18n): add English translations"
```

---

## Task 4: Create IntlProvider with locale logic

**Files:**
- Create: `frontend/src/i18n/IntlProvider.tsx`

**Step 1: Write failing test**

Create `frontend/src/i18n/IntlProvider.test.tsx`:

```tsx
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { AppIntlProvider, useLocale } from './IntlProvider';

describe('IntlProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('navigator', { language: 'en-US' });
  });

  it('should throw error when useLocale is used outside provider', () => {
    expect(() => {
      renderHook(() => useLocale());
    }).toThrow('useLocale must be used within AppIntlProvider');
  });

  it('should detect browser language (English)', () => {
    vi.stubGlobal('navigator', { language: 'en-US' });

    const { result } = renderHook(() => useLocale(), {
      wrapper: AppIntlProvider,
    });

    expect(result.current.locale).toBe('en');
  });

  it('should detect browser language (German)', () => {
    vi.stubGlobal('navigator', { language: 'de-DE' });

    const { result } = renderHook(() => useLocale(), {
      wrapper: AppIntlProvider,
    });

    expect(result.current.locale).toBe('de');
  });

  it('should fallback to German for unsupported languages', () => {
    vi.stubGlobal('navigator', { language: 'fr-FR' });

    const { result } = renderHook(() => useLocale(), {
      wrapper: AppIntlProvider,
    });

    expect(result.current.locale).toBe('de');
  });

  it('should prefer localStorage over browser language', () => {
    localStorage.setItem('locale', 'en');
    vi.stubGlobal('navigator', { language: 'de-DE' });

    const { result } = renderHook(() => useLocale(), {
      wrapper: AppIntlProvider,
    });

    expect(result.current.locale).toBe('en');
  });

  it('should persist locale to localStorage when setLocale is called', () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: AppIntlProvider,
    });

    act(() => {
      result.current.setLocale('de');
    });

    expect(localStorage.getItem('locale')).toBe('de');
    expect(result.current.locale).toBe('de');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- --run IntlProvider.test.tsx`
Expected: FAIL (module not found)

**Step 3: Write the IntlProvider implementation**

Create `frontend/src/i18n/IntlProvider.tsx`:

```tsx
import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import deMessages from './messages/de.json';
import enMessages from './messages/en.json';

type Locale = 'de' | 'en';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

const messages: Record<Locale, Record<string, string>> = {
  de: deMessages,
  en: enMessages,
};

const STORAGE_KEY = 'locale';
const SUPPORTED_LOCALES: Locale[] = ['de', 'en'];
const DEFAULT_LOCALE: Locale = 'de';

function detectBrowserLocale(): Locale {
  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LOCALES.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }
  return DEFAULT_LOCALE;
}

function getInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
    return stored as Locale;
  }
  return detectBrowserLocale();
}

export function AppIntlProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem(STORAGE_KEY, newLocale);
    setLocaleState(newLocale);
  }, []);

  const contextValue = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <LocaleContext.Provider value={contextValue}>
      <IntlProvider locale={locale} messages={messages[locale]} defaultLocale="de">
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within AppIntlProvider');
  }
  return context;
}
```

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- --run IntlProvider.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/i18n/IntlProvider.tsx frontend/src/i18n/IntlProvider.test.tsx
git commit -m "feat(i18n): add IntlProvider with locale detection and persistence"
```

---

## Task 5: Create index export file

**Files:**
- Create: `frontend/src/i18n/index.ts`

**Step 1: Create the index file**

```ts
export { AppIntlProvider, useLocale } from './IntlProvider';
```

**Step 2: Commit**

```bash
git add frontend/src/i18n/index.ts
git commit -m "feat(i18n): add index exports"
```

---

## Task 6: Create LanguageSwitcher component

**Files:**
- Create: `frontend/src/components/LanguageSwitcher.tsx`
- Create: `frontend/src/components/LanguageSwitcher.test.tsx`

**Step 1: Write failing test**

Create `frontend/src/components/LanguageSwitcher.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach } from 'vitest';
import { ThemeProvider } from 'styled-components';
import { createTheme } from '../styles/theme';
import { AppIntlProvider } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

const theme = createTheme('#1a73e8');

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <AppIntlProvider>{children}</AppIntlProvider>
    </ThemeProvider>
  );
}

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render DE and EN buttons', () => {
    render(<LanguageSwitcher />, { wrapper: Wrapper });

    expect(screen.getByRole('button', { name: /DE/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /EN/i })).toBeInTheDocument();
  });

  it('should switch language when clicking a button', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />, { wrapper: Wrapper });

    const enButton = screen.getByRole('button', { name: /EN/i });
    await user.click(enButton);

    expect(localStorage.getItem('locale')).toBe('en');
  });

  it('should highlight active language', () => {
    localStorage.setItem('locale', 'en');
    render(<LanguageSwitcher />, { wrapper: Wrapper });

    const enButton = screen.getByRole('button', { name: /EN/i });
    const deButton = screen.getByRole('button', { name: /DE/i });

    expect(enButton).toHaveAttribute('data-active', 'true');
    expect(deButton).toHaveAttribute('data-active', 'false');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- --run LanguageSwitcher.test.tsx`
Expected: FAIL (module not found)

**Step 3: Write the LanguageSwitcher implementation**

Create `frontend/src/components/LanguageSwitcher.tsx`:

```tsx
import styled from 'styled-components';
import { useLocale } from '../i18n';

const Container = styled.div`
  display: flex;
  gap: 2px;
  background: ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: 2px;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  background: ${(props) => (props.$active ? props.theme.colors.primary : 'transparent')};
  color: ${(props) => (props.$active ? 'white' : props.theme.colors.text)};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.sm};
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? props.theme.colors.primary : props.theme.colors.background)};
  }
`;

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <Container role="group" aria-label="Language selection">
      <ToggleButton
        $active={locale === 'de'}
        data-active={locale === 'de'}
        onClick={() => setLocale('de')}
        aria-pressed={locale === 'de'}
      >
        DE
      </ToggleButton>
      <ToggleButton
        $active={locale === 'en'}
        data-active={locale === 'en'}
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
      >
        EN
      </ToggleButton>
    </Container>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- --run LanguageSwitcher.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/LanguageSwitcher.tsx frontend/src/components/LanguageSwitcher.test.tsx
git commit -m "feat(i18n): add LanguageSwitcher component"
```

---

## Task 7: Integrate IntlProvider into App.tsx

**Files:**
- Modify: `frontend/src/App.tsx`

**Step 1: Update App.tsx to wrap with AppIntlProvider**

Add import at top:
```tsx
import { FormattedMessage } from 'react-intl';
import { AppIntlProvider } from './i18n';
```

Replace the "Connecting to server..." string:
```tsx
// Before:
<div ...>Connecting to server...</div>

// After:
<div ...><FormattedMessage id="app.connecting" /></div>
```

Wrap the entire return in AppIntlProvider (outermost provider):
```tsx
// Before:
return (
  <BrandingProvider>
    ...
  </BrandingProvider>
);

// After:
return (
  <AppIntlProvider>
    <BrandingProvider>
      ...
    </BrandingProvider>
  </AppIntlProvider>
);
```

**Step 2: Run existing tests**

Run: `cd frontend && npm test -- --run`
Expected: All tests pass

**Step 3: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat(i18n): integrate AppIntlProvider into App.tsx"
```

---

## Task 8: Translate LandingPage component

**Files:**
- Modify: `frontend/src/components/LandingPage.tsx`

**Step 1: Update LandingPage with FormattedMessage**

Add import:
```tsx
import { FormattedMessage, useIntl } from 'react-intl';
```

Add useIntl hook for placeholders:
```tsx
const intl = useIntl();
```

Replace all hardcoded strings:

```tsx
// Title
<Title><FormattedMessage id="landing.title" /></Title>

// Section titles
<SectionTitle><FormattedMessage id="landing.createSession" /></SectionTitle>
<SectionTitle><FormattedMessage id="landing.joinSession" /></SectionTitle>

// Input placeholders (use intl.formatMessage)
placeholder={intl.formatMessage({ id: 'landing.yourName' })}
placeholder={intl.formatMessage({ id: 'landing.sessionIdPlaceholder' })}

// Buttons
<Button onClick={handleCreate}><FormattedMessage id="landing.createButton" /></Button>
<Button onClick={handleJoin}><FormattedMessage id="landing.joinButton" /></Button>

// Divider
<Divider><FormattedMessage id="landing.or" /></Divider>

// Error messages in handlers
dialog.error(intl.formatMessage({ id: 'landing.nameRequired' }));
dialog.error(intl.formatMessage({ id: 'landing.sessionIdRequired' }));
```

Add LanguageSwitcher to the page (at the top, before Container closes):
```tsx
import { LanguageSwitcher } from './LanguageSwitcher';

// Add styled component for positioning
const LanguageSwitcherWrapper = styled.div`
  position: absolute;
  top: ${(props) => props.theme.spacing.md};
  right: ${(props) => props.theme.spacing.md};
`;

// Inside Container, at the start:
<LanguageSwitcherWrapper>
  <LanguageSwitcher />
</LanguageSwitcherWrapper>
```

**Step 2: Run tests**

Run: `cd frontend && npm test -- --run LandingPage.test.tsx`
Expected: PASS (update if tests check for specific text)

**Step 3: Commit**

```bash
git add frontend/src/components/LandingPage.tsx
git commit -m "feat(i18n): translate LandingPage component"
```

---

## Task 9: Translate SessionPage component

**Files:**
- Modify: `frontend/src/pages/SessionPage.tsx`

**Step 1: Update SessionPage with FormattedMessage**

Add imports:
```tsx
import { FormattedMessage, useIntl } from 'react-intl';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
```

Add useIntl hook:
```tsx
const intl = useIntl();
```

Replace all hardcoded strings:

```tsx
// Join prompt
<h2><FormattedMessage id="session.joinTitle" /></h2>
placeholder={intl.formatMessage({ id: 'session.enterName' })}
<Button onClick={handleJoin}><FormattedMessage id="session.joinButton" /></Button>

// Error messages
dialog.error(intl.formatMessage({ id: 'session.nameRequired' }));
dialog.error(intl.formatMessage({ id: 'session.invalidSessionId' }), { ... });

// Toast messages
toast.success(intl.formatMessage({ id: 'session.sessionIdCopied' }));
dialog.error(intl.formatMessage({ id: 'session.copyFailed' }, { sessionId }));

// Session ID title
title={intl.formatMessage({ id: 'session.clickToCopy' })}

// Observer toggle button
title={isObserver
  ? intl.formatMessage({ id: 'session.switchToParticipant' })
  : intl.formatMessage({ id: 'session.switchToObserver' })}

// Button text
{isObserver
  ? <FormattedMessage id="session.observerMode" />
  : <FormattedMessage id="session.participantMode" />}
```

Add LanguageSwitcher to Header (in SessionInfo):
```tsx
<SessionInfo>
  <LanguageSwitcher />
  <SessionId ...>...</SessionId>
  ...
</SessionInfo>
```

**Step 2: Run tests**

Run: `cd frontend && npm test -- --run`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/pages/SessionPage.tsx
git commit -m "feat(i18n): translate SessionPage component"
```

---

## Task 10: Translate ModeratorControls component

**Files:**
- Modify: `frontend/src/components/ModeratorControls.tsx`

**Step 1: Update ModeratorControls with FormattedMessage**

Add imports:
```tsx
import { FormattedMessage, useIntl } from 'react-intl';
```

Add useIntl hook:
```tsx
const intl = useIntl();
```

Replace strings:
```tsx
// Reveal button
aria-label={hasEstimates
  ? intl.formatMessage({ id: 'moderator.revealAriaLabel' })
  : intl.formatMessage({ id: 'moderator.revealWaiting' })}
<FormattedMessage id="moderator.revealCards" />

// New Round button
aria-label={intl.formatMessage({ id: 'moderator.newRoundAriaLabel' })}
<FormattedMessage id="moderator.newRound" />
```

**Step 2: Run tests**

Run: `cd frontend && npm test -- --run ModeratorControls.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/components/ModeratorControls.tsx
git commit -m "feat(i18n): translate ModeratorControls component"
```

---

## Task 11: Translate ParticipantList component

**Files:**
- Modify: `frontend/src/components/ParticipantList.tsx`

**Step 1: Update ParticipantList with FormattedMessage**

Add imports:
```tsx
import { FormattedMessage, useIntl } from 'react-intl';
```

Add useIntl hook inside component:
```tsx
const intl = useIntl();
```

Replace strings:
```tsx
// Container aria-label
aria-label={intl.formatMessage({ id: 'participants.regionLabel' })}

// Title
<Title><FormattedMessage id="participants.title" values={{ count: participants.length }} /></Title>

// Badges
aria-label={intl.formatMessage({ id: 'participants.moderatorLabel' })}
aria-label={intl.formatMessage({ id: 'participants.observerLabel' })}
<Badge ...><FormattedMessage id="participants.observer" /></Badge>

// Action button titles
title={participant.isObserver
  ? intl.formatMessage({ id: 'participants.makeParticipant' })
  : intl.formatMessage({ id: 'participants.makeObserver' })}
title={intl.formatMessage({ id: 'participants.transferModerator' })}

// Update getStatusAriaLabel function to use intl
```

Update `getStatusAriaLabel` to accept intl and use translations.

**Step 2: Run tests**

Run: `cd frontend && npm test -- --run ParticipantList.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/components/ParticipantList.tsx
git commit -m "feat(i18n): translate ParticipantList component"
```

---

## Task 12: Translate ResultsView component

**Files:**
- Modify: `frontend/src/components/ResultsView.tsx`

**Step 1: Update ResultsView with FormattedMessage**

Add imports:
```tsx
import { FormattedMessage, useIntl } from 'react-intl';
```

Add useIntl hook:
```tsx
const intl = useIntl();
```

Replace strings:
```tsx
// Container aria-label
aria-label={intl.formatMessage({ id: 'results.regionLabel' })}

// Title
<Title><FormattedMessage id="results.title" /></Title>

// No votes message
<Average ...><FormattedMessage id="results.noVotes" /></Average>

// Average aria-label
aria-label={intl.formatMessage({ id: 'results.averageLabel' }, { value: displayAverage })}

// Vote count (using ICU plural)
<EstimateCount>
  <FormattedMessage id="results.voteCount" values={{ count }} />
</EstimateCount>
```

**Step 2: Run tests**

Run: `cd frontend && npm test -- --run ResultsView.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/components/ResultsView.tsx
git commit -m "feat(i18n): translate ResultsView component"
```

---

## Task 13: Translate Dialog component

**Files:**
- Modify: `frontend/src/components/Dialog.tsx`

**Step 1: Update Dialog with FormattedMessage**

Add imports:
```tsx
import { FormattedMessage, useIntl } from 'react-intl';
```

Add useIntl hook:
```tsx
const intl = useIntl();
```

Replace strings:
```tsx
// Default titles
const defaultTitle = type === 'error'
  ? intl.formatMessage({ id: 'dialog.error' })
  : intl.formatMessage({ id: 'dialog.info' });

// OK button
<OkButton onClick={onClose}><FormattedMessage id="dialog.ok" /></OkButton>
```

**Step 2: Run tests**

Run: `cd frontend && npm test -- --run`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/components/Dialog.tsx
git commit -m "feat(i18n): translate Dialog component"
```

---

## Task 14: Translate Toast component

**Files:**
- Modify: `frontend/src/components/Toast.tsx`

**Step 1: Update Toast with useIntl**

Add import:
```tsx
import { useIntl } from 'react-intl';
```

Add useIntl hook:
```tsx
const intl = useIntl();
```

Replace string:
```tsx
aria-label={intl.formatMessage({ id: 'toast.closeLabel' })}
```

**Step 2: Run tests**

Run: `cd frontend && npm test -- --run`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/components/Toast.tsx
git commit -m "feat(i18n): translate Toast component"
```

---

## Task 15: Translate EstimationCards component

**Files:**
- Modify: `frontend/src/components/EstimationCards.tsx`

**Step 1: Update EstimationCards with FormattedMessage**

Add import:
```tsx
import { FormattedMessage } from 'react-intl';
```

Replace string:
```tsx
<Message><FormattedMessage id="estimation.observerMessage" /></Message>
```

**Step 2: Run tests**

Run: `cd frontend && npm test -- --run EstimationCards.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/components/EstimationCards.tsx
git commit -m "feat(i18n): translate EstimationCards component"
```

---

## Task 16: Update test wrappers

**Files:**
- Modify: `frontend/src/test-setup.ts` or individual test files

**Step 1: Create a test utility wrapper**

If tests fail due to missing IntlProvider, update test wrappers to include `AppIntlProvider`.

Create or update `frontend/src/test-utils.tsx`:
```tsx
import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { createTheme } from './styles/theme';
import { AppIntlProvider } from './i18n';

const theme = createTheme('#1a73e8');

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppIntlProvider>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </AppIntlProvider>
  );
}

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

**Step 2: Run all tests**

Run: `cd frontend && npm test -- --run`
Expected: All PASS

**Step 3: Commit**

```bash
git add frontend/src/test-utils.tsx
git commit -m "test: add test utilities with i18n support"
```

---

## Task 17: Final verification

**Step 1: Run full test suite**

Run: `cd frontend && npm test -- --run`
Expected: All tests pass

**Step 2: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds without errors

**Step 3: Manual verification**

Run: `cd frontend && npm run dev`
- Open browser, verify German is shown (if browser is German)
- Click EN button, verify English text
- Reload page, verify English persists
- Click DE button, verify German text

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(i18n): complete react-intl internationalization

- Browser language detection (German/English)
- Manual language switcher (DE | EN toggle)
- LocalStorage persistence for user preference
- All UI components translated"
```

---

## Summary

Total tasks: 17
Estimated commits: ~17

Key files created:
- `frontend/src/i18n/IntlProvider.tsx`
- `frontend/src/i18n/IntlProvider.test.tsx`
- `frontend/src/i18n/messages/de.json`
- `frontend/src/i18n/messages/en.json`
- `frontend/src/i18n/index.ts`
- `frontend/src/components/LanguageSwitcher.tsx`
- `frontend/src/components/LanguageSwitcher.test.tsx`

Key files modified:
- `frontend/src/App.tsx`
- `frontend/src/components/LandingPage.tsx`
- `frontend/src/pages/SessionPage.tsx`
- `frontend/src/components/ModeratorControls.tsx`
- `frontend/src/components/ParticipantList.tsx`
- `frontend/src/components/ResultsView.tsx`
- `frontend/src/components/Dialog.tsx`
- `frontend/src/components/Toast.tsx`
- `frontend/src/components/EstimationCards.tsx`
