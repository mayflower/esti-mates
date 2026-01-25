import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from 'styled-components';
import { createTheme } from '../styles/theme';
import { NotificationProvider, useNotification } from './NotificationContext';

const theme = createTheme('#1a73e8');

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <NotificationProvider>{children}</NotificationProvider>
    </ThemeProvider>
  );
}

describe('NotificationContext', () => {
  it('should throw error when useNotification is used outside provider', () => {
    expect(() => {
      renderHook(() => useNotification());
    }).toThrow('useNotification must be used within NotificationProvider');
  });

  it('should provide toast and dialog functions', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: Wrapper,
    });

    expect(result.current.toast).toBeDefined();
    expect(result.current.toast.success).toBeInstanceOf(Function);
    expect(result.current.toast.error).toBeInstanceOf(Function);
    expect(result.current.toast.info).toBeInstanceOf(Function);
    expect(result.current.dialog).toBeDefined();
    expect(result.current.dialog.error).toBeInstanceOf(Function);
    expect(result.current.dialog.show).toBeInstanceOf(Function);
  });

  it('should add toast and respect max 5 limit', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: Wrapper,
    });

    act(() => {
      for (let i = 0; i < 7; i++) {
        result.current.toast.success(`Toast ${i}`);
      }
    });

    expect(result.current.toasts).toHaveLength(5);
  });

  it('should add dialog and replace previous', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.dialog.error('First error');
    });

    expect(result.current.currentDialog?.message).toBe('First error');

    act(() => {
      result.current.dialog.error('Second error');
    });

    expect(result.current.currentDialog?.message).toBe('Second error');
  });
});
