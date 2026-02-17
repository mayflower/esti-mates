import { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef, ReactNode } from 'react';
import { ToastContainer } from '../components/ToastContainer';
import { DialogContainer } from '../components/DialogContainer';

// Types
export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface Dialog {
  title?: string;
  message: string;
  type?: 'error' | 'info';
  onClose?: () => void;
}

interface NotificationContextValue {
  toasts: Toast[];
  currentDialog: Dialog | null;
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
  dialog: {
    error: (message: string, options?: { title?: string; onClose?: () => void }) => void;
    show: (options: Dialog) => void;
  };
  removeToast: (id: string) => void;
  closeDialog: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentDialog, setCurrentDialog] = useState<Dialog | null>(null);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    // Clear timeout if it exists
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: Toast = { id, message, type, duration };

    setToasts((prev) => {
      const updated = [newToast, ...prev];
      return updated.slice(0, 5); // Max 5 toasts
    });

    // Auto-remove after duration
    const timeoutId = setTimeout(() => {
      removeToast(id);
    }, duration);

    timeoutsRef.current.set(id, timeoutId);
  }, [removeToast]);

  const showDialog = useCallback((dialog: Dialog) => {
    setCurrentDialog(dialog);
  }, []);

  const closeDialog = useCallback(() => {
    setCurrentDialog((current) => {
      if (current?.onClose) {
        current.onClose();
      }
      return null;
    });
  }, []);

  const toast = useMemo(() => ({
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
  }), [addToast]);

  const dialog = useMemo(() => ({
    error: (message: string, options?: { title?: string; onClose?: () => void }) => {
      showDialog({
        message,
        type: 'error',
        title: options?.title || 'Error',
        onClose: options?.onClose,
      });
    },
    show: (options: Dialog) => {
      showDialog(options);
    },
  }), [showDialog]);

  const value = useMemo<NotificationContextValue>(() => ({
    toasts,
    currentDialog,
    toast,
    dialog,
    removeToast,
    closeDialog,
  }), [toasts, currentDialog, toast, dialog, removeToast, closeDialog]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <DialogContainer dialog={currentDialog} onClose={closeDialog} />
    </NotificationContext.Provider>
  );
}
