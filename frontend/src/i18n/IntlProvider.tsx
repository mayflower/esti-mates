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
