import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from 'styled-components';
import { createTheme } from '../styles/theme';
import { AppIntlProvider } from '../i18n';
import { DialogContainer } from './DialogContainer';
import { Dialog as DialogType } from '../contexts/NotificationContext';

const theme = createTheme('#1a73e8');

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <AppIntlProvider>{children}</AppIntlProvider>
    </ThemeProvider>
  );
}

describe('DialogContainer', () => {
  it('should render dialog when provided', () => {
    const dialog: DialogType = {
      message: 'Test dialog',
      type: 'error',
    };

    render(
      <DialogContainer dialog={dialog} onClose={() => {}} />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Test dialog')).toBeDefined();
  });

  it('should not render when dialog is null', () => {
    const { container } = render(
      <DialogContainer dialog={null} onClose={() => {}} />,
      { wrapper: Wrapper }
    );

    expect(container.firstChild).toBeNull();
  });
});
