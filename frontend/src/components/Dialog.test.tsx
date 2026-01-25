import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from 'styled-components';
import { createTheme } from '../styles/theme';
import { AppIntlProvider } from '../i18n';
import { Dialog } from './Dialog';

const theme = createTheme('#1a73e8');

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <AppIntlProvider>{children}</AppIntlProvider>
    </ThemeProvider>
  );
}

describe('Dialog', () => {
  it('should render dialog with message', () => {
    render(
      <Dialog
        message="Test error message"
        type="error"
        onClose={() => {}}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Test error message')).toBeDefined();
  });

  it('should show error icon for error type', () => {
    const { container } = render(
      <Dialog
        message="Error"
        type="error"
        onClose={() => {}}
      />,
      { wrapper: Wrapper }
    );

    // Error dialog should have red styling
    expect(container.querySelector('[data-type="error"]')).toBeDefined();
  });

  it('should call onClose when OK button clicked', () => {
    const onClose = vi.fn();
    render(
      <Dialog
        message="Test"
        type="error"
        onClose={onClose}
      />,
      { wrapper: Wrapper }
    );

    const okButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(okButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should render custom title when provided', () => {
    render(
      <Dialog
        title="Custom Title"
        message="Message"
        type="error"
        onClose={() => {}}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Custom Title')).toBeDefined();
  });
});
