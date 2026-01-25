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
