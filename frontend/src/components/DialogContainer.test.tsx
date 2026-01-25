import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from 'styled-components';
import { createTheme } from '../styles/theme';
import { DialogContainer } from './DialogContainer';
import { Dialog as DialogType } from '../contexts/NotificationContext';

const theme = createTheme('#1a73e8');

describe('DialogContainer', () => {
  it('should render dialog when provided', () => {
    const dialog: DialogType = {
      message: 'Test dialog',
      type: 'error',
    };

    render(
      <ThemeProvider theme={theme}>
        <DialogContainer dialog={dialog} onClose={() => {}} />
      </ThemeProvider>
    );

    expect(screen.getByText('Test dialog')).toBeDefined();
  });

  it('should not render when dialog is null', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <DialogContainer dialog={null} onClose={() => {}} />
      </ThemeProvider>
    );

    expect(container.firstChild).toBeNull();
  });
});
