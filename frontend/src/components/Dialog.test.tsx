import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from 'styled-components';
import { createTheme } from '../styles/theme';
import { Dialog } from './Dialog';

const theme = createTheme('#1a73e8');

describe('Dialog', () => {
  it('should render dialog with message', () => {
    render(
      <ThemeProvider theme={theme}>
        <Dialog
          message="Test error message"
          type="error"
          onClose={() => {}}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('Test error message')).toBeDefined();
  });

  it('should show error icon for error type', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Dialog
          message="Error"
          type="error"
          onClose={() => {}}
        />
      </ThemeProvider>
    );

    // Error dialog should have red styling
    expect(container.querySelector('[data-type="error"]')).toBeDefined();
  });

  it('should call onClose when OK button clicked', () => {
    const onClose = vi.fn();
    render(
      <ThemeProvider theme={theme}>
        <Dialog
          message="Test"
          type="error"
          onClose={onClose}
        />
      </ThemeProvider>
    );

    const okButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(okButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should render custom title when provided', () => {
    render(
      <ThemeProvider theme={theme}>
        <Dialog
          title="Custom Title"
          message="Message"
          type="error"
          onClose={() => {}}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('Custom Title')).toBeDefined();
  });
});
