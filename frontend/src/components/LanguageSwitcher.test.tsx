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
