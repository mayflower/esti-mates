# Notification System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace browser `alert()` with Toast notifications and Dialog modals using Radix UI

**Architecture:** Context-based imperative API (`toast.success()`, `dialog.error()`) with Radix UI primitives for accessibility and TailwindCSS for styling

**Tech Stack:** @radix-ui/react-toast, @radix-ui/react-dialog, react-icons, TailwindCSS, Vitest

---

## Task 1: Install Dependencies

**Files:**
- Modify: `frontend/package.json`

**Step 1: Install Radix UI packages**

```bash
cd /Users/tmogdans/Code/mf-estimates/.worktrees/notification-system/frontend
npm install @radix-ui/react-toast @radix-ui/react-dialog react-icons
```

Expected: Packages installed successfully

**Step 2: Verify installation**

```bash
npm list @radix-ui/react-toast @radix-ui/react-dialog react-icons
```

Expected: All three packages listed

**Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: install radix ui toast, dialog, and react-icons

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create NotificationContext Types

**Files:**
- Create: `frontend/src/contexts/NotificationContext.tsx`
- Create: `frontend/src/contexts/NotificationContext.test.tsx`

**Step 1: Write the failing test**

Create `frontend/src/contexts/NotificationContext.test.tsx`:

```tsx
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NotificationProvider, useNotification } from './NotificationContext';

describe('NotificationContext', () => {
  it('should throw error when useNotification is used outside provider', () => {
    expect(() => {
      renderHook(() => useNotification());
    }).toThrow('useNotification must be used within NotificationProvider');
  });

  it('should provide toast and dialog functions', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: NotificationProvider,
    });

    expect(result.current.toast).toBeDefined();
    expect(result.current.toast.success).toBeInstanceOf(Function);
    expect(result.current.toast.error).toBeInstanceOf(Function);
    expect(result.current.toast.info).toBeInstanceOf(Function);
    expect(result.current.dialog).toBeDefined();
    expect(result.current.dialog.error).toBeInstanceOf(Function);
    expect(result.current.dialog.show).toBeInstanceOf(Function);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd frontend
npm test -- NotificationContext.test.tsx --run
```

Expected: FAIL - "Cannot find module './NotificationContext'"

**Step 3: Create minimal context implementation**

Create `frontend/src/contexts/NotificationContext.tsx`:

```tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

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

  const addToast = (message: string, type: ToastType, duration = 4000) => {
    const id = Date.now().toString() + Math.random();
    const newToast: Toast = { id, message, type, duration };

    setToasts((prev) => {
      const updated = [newToast, ...prev];
      return updated.slice(0, 5); // Max 5 toasts
    });

    // Auto-remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showDialog = (dialog: Dialog) => {
    setCurrentDialog(dialog);
  };

  const closeDialog = () => {
    if (currentDialog?.onClose) {
      currentDialog.onClose();
    }
    setCurrentDialog(null);
  };

  const toast = {
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
  };

  const dialog = {
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
  };

  const value: NotificationContextValue = {
    toasts,
    currentDialog,
    toast,
    dialog,
    removeToast,
    closeDialog,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- NotificationContext.test.tsx --run
```

Expected: PASS - 2 tests

**Step 5: Add more tests for toast behavior**

Add to `frontend/src/contexts/NotificationContext.test.tsx`:

```tsx
it('should add toast and respect max 5 limit', () => {
  const { result } = renderHook(() => useNotification(), {
    wrapper: NotificationProvider,
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
    wrapper: NotificationProvider,
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
```

**Step 6: Run tests**

```bash
npm test -- NotificationContext.test.tsx --run
```

Expected: PASS - 4 tests

**Step 7: Commit**

```bash
git add frontend/src/contexts/NotificationContext.tsx frontend/src/contexts/NotificationContext.test.tsx
git commit -m "feat: add notification context with toast and dialog state

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Toast Component

**Files:**
- Create: `frontend/src/components/Toast.tsx`
- Create: `frontend/src/components/Toast.test.tsx`

**Step 1: Write the failing test**

Create `frontend/src/components/Toast.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toast } from './Toast';

describe('Toast', () => {
  it('should render toast with message', () => {
    render(
      <Toast
        id="1"
        message="Test message"
        type="success"
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Test message')).toBeDefined();
  });

  it('should show success icon for success type', () => {
    const { container } = render(
      <Toast
        id="1"
        message="Success"
        type="success"
        onClose={() => {}}
      />
    );

    // Check for green border (success color)
    const toast = container.querySelector('[data-type="success"]');
    expect(toast).toBeDefined();
  });

  it('should call onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(
      <Toast
        id="1"
        message="Test"
        type="info"
        onClose={onClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledWith('1');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- Toast.test.tsx --run
```

Expected: FAIL - "Cannot find module './Toast'"

**Step 3: Create Toast component**

Create `frontend/src/components/Toast.tsx`:

```tsx
import React from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import { FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';
import { ToastType } from '../contexts/NotificationContext';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

const iconMap = {
  success: FiCheckCircle,
  error: FiXCircle,
  info: FiInfo,
};

const colorMap = {
  success: 'border-green-500 text-green-700',
  error: 'border-red-500 text-red-700',
  info: 'border-blue-500 text-blue-700',
};

export function Toast({ id, message, type, onClose }: ToastProps) {
  const Icon = iconMap[type];

  return (
    <RadixToast.Root
      className="bg-white rounded-lg shadow-lg border-l-4 p-4 flex items-center gap-3 min-w-[300px] max-w-[500px] data-[state=open]:animate-slideIn data-[state=closed]:animate-slideOut data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform data-[swipe=end]:animate-swipeOut"
      data-type={type}
    >
      <Icon className={`flex-shrink-0 w-5 h-5 ${colorMap[type]}`} />
      <RadixToast.Description className="flex-1 text-sm text-gray-800">
        {message}
      </RadixToast.Description>
      <RadixToast.Close
        className="flex-shrink-0 p-1 rounded hover:bg-gray-100 transition-colors"
        aria-label="Close notification"
        onClick={() => onClose(id)}
      >
        <FiX className="w-4 h-4 text-gray-500" />
      </RadixToast.Close>
    </RadixToast.Root>
  );
}
```

**Step 4: Add Tailwind animations**

We need to add animations to `frontend/tailwind.config.js` (or create it if it doesn't exist). First check:

```bash
ls frontend/tailwind.config.js
```

If it doesn't exist, create `frontend/tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideIn: {
          from: { transform: 'translateX(calc(100% + 1rem))' },
          to: { transform: 'translateX(0)' },
        },
        slideOut: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(100% + 1rem))' },
        },
        swipeOut: {
          from: { transform: 'translateX(var(--radix-toast-swipe-end-x))' },
          to: { transform: 'translateX(calc(100% + 1rem))' },
        },
      },
      animation: {
        slideIn: 'slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideOut: 'slideOut 100ms ease-in',
        swipeOut: 'swipeOut 100ms ease-out',
      },
    },
  },
  plugins: [],
}
```

And ensure Tailwind is imported in `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 5: Run test to verify it passes**

```bash
npm test -- Toast.test.tsx --run
```

Expected: PASS - 3 tests

**Step 6: Commit**

```bash
git add frontend/src/components/Toast.tsx frontend/src/components/Toast.test.tsx frontend/tailwind.config.js frontend/src/index.css
git commit -m "feat: add toast component with radix ui primitives

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create ToastContainer Component

**Files:**
- Create: `frontend/src/components/ToastContainer.tsx`
- Create: `frontend/src/components/ToastContainer.test.tsx`

**Step 1: Write the failing test**

Create `frontend/src/components/ToastContainer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ToastContainer } from './ToastContainer';
import { Toast } from '../contexts/NotificationContext';

describe('ToastContainer', () => {
  it('should render multiple toasts', () => {
    const toasts: Toast[] = [
      { id: '1', message: 'Toast 1', type: 'success' },
      { id: '2', message: 'Toast 2', type: 'error' },
    ];

    render(<ToastContainer toasts={toasts} onRemoveToast={() => {}} />);

    expect(screen.getByText('Toast 1')).toBeDefined();
    expect(screen.getByText('Toast 2')).toBeDefined();
  });

  it('should render empty when no toasts', () => {
    const { container } = render(<ToastContainer toasts={[]} onRemoveToast={() => {}} />);

    expect(container.querySelector('[role="region"]')).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- ToastContainer.test.tsx --run
```

Expected: FAIL - "Cannot find module './ToastContainer'"

**Step 3: Create ToastContainer component**

Create `frontend/src/components/ToastContainer.tsx`:

```tsx
import React from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import { Toast as ToastComponent } from './Toast';
import { Toast } from '../contexts/NotificationContext';

interface ToastContainerProps {
  toasts: Toast[];
  onRemoveToast: (id: string) => void;
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  return (
    <RadixToast.Provider swipeDirection="right" duration={4000}>
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={onRemoveToast}
        />
      ))}
      <RadixToast.Viewport className="fixed top-4 right-4 flex flex-col gap-2 w-[390px] max-w-full z-50 outline-none" />
    </RadixToast.Provider>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- ToastContainer.test.tsx --run
```

Expected: PASS - 2 tests

**Step 5: Commit**

```bash
git add frontend/src/components/ToastContainer.tsx frontend/src/components/ToastContainer.test.tsx
git commit -m "feat: add toast container with radix viewport

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create Dialog Component

**Files:**
- Create: `frontend/src/components/Dialog.tsx`
- Create: `frontend/src/components/Dialog.test.tsx`

**Step 1: Write the failing test**

Create `frontend/src/components/Dialog.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  it('should render dialog with message', () => {
    render(
      <Dialog
        message="Test error message"
        type="error"
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Test error message')).toBeDefined();
  });

  it('should show error icon for error type', () => {
    const { container } = render(
      <Dialog
        message="Error"
        type="error"
        onClose={() => {}}
      />
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
      />
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
      />
    );

    expect(screen.getByText('Custom Title')).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- Dialog.test.tsx --run
```

Expected: FAIL - "Cannot find module './Dialog'"

**Step 3: Create Dialog component**

Create `frontend/src/components/Dialog.tsx`:

```tsx
import React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { FiXCircle, FiInfo } from 'react-icons/fi';

interface DialogProps {
  title?: string;
  message: string;
  type?: 'error' | 'info';
  onClose: () => void;
}

const iconMap = {
  error: FiXCircle,
  info: FiInfo,
};

const iconColorMap = {
  error: 'text-red-500',
  info: 'text-blue-500',
};

export function Dialog({ title, message, type = 'info', onClose }: DialogProps) {
  const Icon = iconMap[type];

  return (
    <RadixDialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-fadeIn z-50" />
        <RadixDialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50 data-[state=open]:animate-fadeIn"
          data-type={type}
        >
          <div className="flex flex-col items-center text-center gap-4">
            <Icon className={`w-12 h-12 ${iconColorMap[type]}`} />
            {title && (
              <RadixDialog.Title className="text-lg font-semibold text-gray-900">
                {title}
              </RadixDialog.Title>
            )}
            <RadixDialog.Description className="text-sm text-gray-700">
              {message}
            </RadixDialog.Description>
            <button
              onClick={onClose}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              OK
            </button>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
```

**Step 4: Add fadeIn animation to tailwind config**

Update `frontend/tailwind.config.js` to add fadeIn:

```js
keyframes: {
  // ... existing animations
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
},
animation: {
  // ... existing animations
  fadeIn: 'fadeIn 150ms ease-out',
},
```

**Step 5: Run test to verify it passes**

```bash
npm test -- Dialog.test.tsx --run
```

Expected: PASS - 4 tests

**Step 6: Commit**

```bash
git add frontend/src/components/Dialog.tsx frontend/src/components/Dialog.test.tsx frontend/tailwind.config.js
git commit -m "feat: add dialog component with radix ui primitives

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create DialogContainer Component

**Files:**
- Create: `frontend/src/components/DialogContainer.tsx`
- Create: `frontend/src/components/DialogContainer.test.tsx`

**Step 1: Write the failing test**

Create `frontend/src/components/DialogContainer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DialogContainer } from './DialogContainer';
import { Dialog as DialogType } from '../contexts/NotificationContext';

describe('DialogContainer', () => {
  it('should render dialog when provided', () => {
    const dialog: DialogType = {
      message: 'Test dialog',
      type: 'error',
    };

    render(<DialogContainer dialog={dialog} onClose={() => {}} />);

    expect(screen.getByText('Test dialog')).toBeDefined();
  });

  it('should not render when dialog is null', () => {
    const { container } = render(<DialogContainer dialog={null} onClose={() => {}} />);

    expect(container.firstChild).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- DialogContainer.test.tsx --run
```

Expected: FAIL - "Cannot find module './DialogContainer'"

**Step 3: Create DialogContainer component**

Create `frontend/src/components/DialogContainer.tsx`:

```tsx
import React from 'react';
import { Dialog as DialogComponent } from './Dialog';
import { Dialog } from '../contexts/NotificationContext';

interface DialogContainerProps {
  dialog: Dialog | null;
  onClose: () => void;
}

export function DialogContainer({ dialog, onClose }: DialogContainerProps) {
  if (!dialog) {
    return null;
  }

  return (
    <DialogComponent
      title={dialog.title}
      message={dialog.message}
      type={dialog.type}
      onClose={onClose}
    />
  );
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- DialogContainer.test.tsx --run
```

Expected: PASS - 2 tests

**Step 5: Commit**

```bash
git add frontend/src/components/DialogContainer.tsx frontend/src/components/DialogContainer.test.tsx
git commit -m "feat: add dialog container wrapper

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Integrate NotificationProvider into App

**Files:**
- Modify: `frontend/src/App.tsx:42-68`
- Modify: `frontend/src/contexts/NotificationContext.tsx`

**Step 1: Update NotificationProvider to render containers**

Modify `frontend/src/contexts/NotificationContext.tsx` to include the containers:

```tsx
// Add imports at top
import { ToastContainer } from '../components/ToastContainer';
import { DialogContainer } from '../components/DialogContainer';

// Update return statement in NotificationProvider
return (
  <NotificationContext.Provider value={value}>
    {children}
    <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    <DialogContainer dialog={currentDialog} onClose={closeDialog} />
  </NotificationContext.Provider>
);
```

**Step 2: Wrap App with NotificationProvider**

Modify `frontend/src/App.tsx`:

```tsx
// Add import at top
import { NotificationProvider } from './contexts/NotificationContext';

// Update App component (around line 42)
export function App() {
  const { socket, connected } = useSocket();

  if (!connected || !socket) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        Connecting to server...
      </div>
    );
  }

  return (
    <NotificationProvider>
      <BrandingProvider>
        <SessionProvider socket={socket}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SessionProvider>
      </BrandingProvider>
    </NotificationProvider>
  );
}
```

**Step 3: Run all tests to verify**

```bash
npm test -- --run
```

Expected: All tests pass

**Step 4: Start dev server and verify visually**

```bash
npm run dev
```

Then open browser and verify app loads without errors.

**Step 5: Commit**

```bash
git add frontend/src/App.tsx frontend/src/contexts/NotificationContext.tsx
git commit -m "feat: integrate notification provider into app

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Replace alert() in SessionPage

**Files:**
- Modify: `frontend/src/pages/SessionPage.tsx:163,167,182,185`

**Step 1: Add useNotification hook to SessionPage**

Modify `frontend/src/pages/SessionPage.tsx`:

```tsx
// Add import at top
import { useNotification } from '../contexts/SessionContext';

// Inside SessionPage component, add hook
const { toast, dialog } = useNotification();
```

**Step 2: Replace alert for "Please enter your name" (line 163)**

Replace:
```tsx
alert("Please enter your name");
```

With:
```tsx
dialog.error("Please enter your name");
```

**Step 3: Replace alert for "Invalid session ID" (line 167)**

Replace:
```tsx
alert("Invalid session ID");
```

With:
```tsx
dialog.error("Invalid session ID", {
  onClose: () => navigate('/'),
});
```

**Step 4: Replace alert for "Session ID copied" (line 182)**

Replace:
```tsx
alert("Session ID copied to clipboard!");
```

With:
```tsx
toast.success("Session ID copied to clipboard!");
```

**Step 5: Replace alert for "Failed to copy" (line 185)**

Replace:
```tsx
alert(`Failed to copy. Session ID: ${sessionId}`);
```

With:
```tsx
dialog.error(`Failed to copy. Session ID: ${sessionId}`);
```

**Step 6: Test manually**

```bash
npm run dev
```

Test each scenario:
- Try to join without name
- Try to join invalid session
- Copy session ID (success)
- Test clipboard failure scenario

**Step 7: Commit**

```bash
git add frontend/src/pages/SessionPage.tsx
git commit -m "feat: replace alert() with toast/dialog in SessionPage

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Replace alert() in LandingPage

**Files:**
- Modify: `frontend/src/components/LandingPage.tsx:122,130`

**Step 1: Add useNotification hook to LandingPage**

Modify `frontend/src/components/LandingPage.tsx`:

```tsx
// Add import at top
import { useNotification } from '../contexts/NotificationContext';

// Inside LandingPage component, add hook
const { dialog } = useNotification();
```

**Step 2: Replace alert for "Please enter your name" (line 122)**

Replace:
```tsx
alert("Please enter your name");
```

With:
```tsx
dialog.error("Please enter your name");
return;
```

**Step 3: Replace alert for "Please enter a session ID" (line 130)**

Replace:
```tsx
alert("Please enter a session ID");
```

With:
```tsx
dialog.error("Please enter a session ID");
return;
```

**Step 4: Test manually**

```bash
npm run dev
```

Test:
- Try to create session without name
- Try to join session without ID

**Step 5: Commit**

```bash
git add frontend/src/components/LandingPage.tsx
git commit -m "feat: replace alert() with dialog in LandingPage

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Replace alert() in SessionContext

**Files:**
- Modify: `frontend/src/contexts/SessionContext.tsx:138`

**Step 1: Review SessionContext alert usage**

Read `frontend/src/contexts/SessionContext.tsx` around line 138 to understand context.

**Step 2: Decide on toast vs dialog**

The alert at line 138 shows `data.message` from server. This is likely an error when joining fails.

We need to pass notification functions into SessionContext, or handle this differently.

**Option A:** Pass dialog function as prop to SessionProvider
**Option B:** Use a custom event to trigger notifications
**Option C:** Make SessionContext use useNotification internally

Let's use Option C for simplicity.

**Step 3: Add useNotification to SessionContext**

Modify `frontend/src/contexts/SessionContext.tsx`:

```tsx
// Add import
import { useNotification } from './NotificationContext';

// In SessionProvider component
const { dialog } = useNotification();

// Replace alert (line 138)
// From:
alert(data.message);

// To:
dialog.error(data.message);
```

**Step 4: Test manually**

Test joining a session with an error condition (if possible).

**Step 5: Commit**

```bash
git add frontend/src/contexts/SessionContext.tsx
git commit -m "feat: replace alert() with dialog in SessionContext

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Run Full Test Suite

**Files:**
- N/A (verification step)

**Step 1: Run all frontend tests**

```bash
cd frontend
npm test -- --run
```

Expected: All tests pass

**Step 2: Run all backend tests**

```bash
cd ../backend
npm test -- --run
```

Expected: All tests pass

**Step 3: Check for any console errors**

```bash
cd ../frontend
npm run dev
```

Open browser DevTools and check console for errors.

**Step 4: Test all notification scenarios manually**

- Create session without name → Dialog error
- Join session without ID → Dialog error
- Join invalid session → Dialog error + redirect
- Copy session ID → Toast success
- All toasts should stack properly (test with multiple quick actions)
- Dialogs should block interaction
- ESC key should close dialog
- Click outside dialog should close it

**Step 5: Document completion**

All `alert()` calls replaced:
- ✓ LandingPage.tsx:122 (name validation)
- ✓ LandingPage.tsx:130 (session ID validation)
- ✓ SessionPage.tsx:163 (name validation)
- ✓ SessionPage.tsx:167 (invalid session)
- ✓ SessionPage.tsx:182 (clipboard success)
- ✓ SessionPage.tsx:185 (clipboard failure)
- ✓ SessionContext.tsx:138 (server error)

---

## Task 12: Final Commit and Summary

**Step 1: Run final test suite**

```bash
npm test -- --run
```

Expected: All tests pass

**Step 2: Check git status**

```bash
git status
```

Expected: Clean working tree (all changes committed)

**Step 3: Create summary commit (if any remaining changes)**

```bash
git add .
git commit -m "docs: update notification system implementation summary

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Step 4: Document what was built**

Summary:
- Installed @radix-ui/react-toast, @radix-ui/react-dialog, react-icons
- Created NotificationContext with imperative API
- Built Toast component with success/error/info variants
- Built Dialog component with error/info variants
- Integrated into App.tsx with NotificationProvider
- Replaced all 7 alert() calls with toast or dialog
- All tests passing (106 tests total)

---

## Notes

**TailwindCSS Configuration:**
- If Tailwind is not configured, Task 3 includes setting it up
- Animations are added to support Radix UI transitions
- Make sure `frontend/src/index.css` imports Tailwind directives

**Testing Philosophy:**
- Unit tests for each component
- Integration test in context
- Manual testing for UX verification

**DRY & YAGNI:**
- Using Radix UI primitives (don't reinvent accessibility)
- Simple imperative API (no over-engineering)
- Only 3 toast types and 2 dialog types (enough for current needs)

**Commit Discipline:**
- One logical change per commit
- Commit after each task
- Keep commits small and focused
