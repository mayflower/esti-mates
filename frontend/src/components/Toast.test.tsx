import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as RadixToast from '@radix-ui/react-toast';
import { ThemeProvider } from 'styled-components';
import { AppIntlProvider } from '../i18n';
import { Toast } from './Toast';

const theme = {
  brandName: 'Test Brand',
  brandLogoUrl: '/test-logo.svg',
  brandPrimaryColor: '#1a73e8',
  brandFooterText: 'Test Footer',
  colors: {
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#212121',
    textSecondary: '#757575',
    primary: '#1a73e8',
    primaryHover: '#1557b0',
    border: '#e0e0e0',
    success: '#4caf50',
    error: '#f44336',
    waiting: '#9e9e9e',
    warning: '#ff9800',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 4px 6px rgba(0,0,0,0.16)',
    lg: '0 10px 20px rgba(0,0,0,0.19)',
  },
};

function renderToast(props: Parameters<typeof Toast>[0]) {
  return render(
    <ThemeProvider theme={theme}>
      <AppIntlProvider>
        <RadixToast.Provider>
          <Toast {...props} />
          <RadixToast.Viewport />
        </RadixToast.Provider>
      </AppIntlProvider>
    </ThemeProvider>
  );
}

describe('Toast', () => {
  it('should render toast with message', () => {
    renderToast({
      id: '1',
      message: 'Test message',
      type: 'success',
      onClose: () => {},
    });

    expect(screen.getByText('Test message')).toBeDefined();
  });

  it('should show success icon for success type', () => {
    const { container } = renderToast({
      id: '1',
      message: 'Success',
      type: 'success',
      onClose: () => {},
    });

    const toast = container.querySelector('[data-type="success"]');
    expect(toast).toBeDefined();
  });

  it('should call onClose when close button clicked', () => {
    const onClose = vi.fn();
    renderToast({
      id: '1',
      message: 'Test',
      type: 'info',
      onClose,
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledWith('1');
  });
});
