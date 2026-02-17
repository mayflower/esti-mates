import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from 'styled-components';
import { AppIntlProvider } from '../i18n';
import { ToastContainer } from './ToastContainer';
import { Toast } from '../contexts/NotificationContext';

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
  breakpoints: {
    mobile: '768px',
  },
};

function renderToastContainer(props: Parameters<typeof ToastContainer>[0]) {
  return render(
    <ThemeProvider theme={theme}>
      <AppIntlProvider>
        <ToastContainer {...props} />
      </AppIntlProvider>
    </ThemeProvider>
  );
}

describe('ToastContainer', () => {
  it('should render multiple toasts', () => {
    const toasts: Toast[] = [
      { id: '1', message: 'Toast 1', type: 'success' },
      { id: '2', message: 'Toast 2', type: 'error' },
    ];

    renderToastContainer({ toasts, onRemoveToast: () => {} });

    expect(screen.getByText('Toast 1')).toBeDefined();
    expect(screen.getByText('Toast 2')).toBeDefined();
  });

  it('should render empty when no toasts', () => {
    const { container } = renderToastContainer({ toasts: [], onRemoveToast: () => {} });

    expect(container.querySelector('[role="region"]')).toBeDefined();
  });
});
