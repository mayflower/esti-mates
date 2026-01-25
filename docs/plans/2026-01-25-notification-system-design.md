# Notification System Design

**Date:** 2026-01-25
**Status:** Approved

## Problem

The application currently uses browser `alert()` for all user feedback (validation errors, success messages, system errors). This provides poor UX and looks unprofessional.

## Solution

Replace `alert()` with a proper notification system using:
- **Toast notifications** for non-blocking feedback (success, info)
- **Modal dialogs** for errors requiring acknowledgment
- **Inline validation** (optional future enhancement) for form fields

## Architecture

### Components

**NotificationProvider (Context)**
- Wraps app in `App.tsx`
- Manages state for active toasts and dialogs
- Provides imperative API via Context Hook
- Renders `ToastContainer` and `DialogContainer`

**Toast System**
- `Toast.tsx` - Single toast component with Radix UI primitives
- `ToastContainer.tsx` - Renders stack of toasts (max 5)

**Dialog System**
- `Dialog.tsx` - Modal dialog with Radix UI Dialog
- `DialogContainer.tsx` - Renders active dialog

### Technology Stack

- `@radix-ui/react-toast` - Toast primitives
- `@radix-ui/react-dialog` - Dialog primitives
- `react-icons` - Icons (FiCheckCircle, FiXCircle, FiInfo)
- TailwindCSS - Styling

## API Design

### Imperative API (Context-based)

```tsx
const { toast, dialog } = useNotification();

// Toast API
toast.success("Session ID copied!");
toast.error("Failed to copy");
toast.info("Session started");

// Dialog API
dialog.error("Invalid session ID", {
  onClose: () => navigate('/')
});

dialog.show({
  title: "Error",
  message: "Something went wrong",
  onClose: () => {}
});
```

## Toast Specifications

### Behavior
- Position: Top-right (fixed)
- Auto-dismiss: 4 seconds (configurable)
- Hover: Pauses auto-dismiss
- Swipe-to-dismiss: Enabled (Radix feature)
- Stack: Max 5 toasts, newest on top
- Overflow: Oldest auto-removed when limit reached

### Visual Design
- Background: White/light
- Shadow: For elevation
- Border-left: Type-based accent color
  - Success: Green + ✓ icon
  - Error: Red + ✗ icon
  - Info: Blue + ℹ icon
- Layout: `[Icon] [Message] [Close ×]`
- Animation: Slide + fade (enter/exit)

### State Management
```tsx
type Toast = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

const [toasts, setToasts] = useState<Toast[]>([]);
```

## Dialog Specifications

### Behavior
- Position: Centered (fixed)
- Backdrop: Dark overlay (bg-black/50)
- Blocking: Prevents interaction with content behind
- ESC key: Closes dialog
- Click outside: Closes dialog (configurable)
- Focus trap: Tab navigation stays within dialog
- Limit: Only one dialog at a time (new replaces old)

### Visual Design
- Container: White content box
- Corners: Rounded (rounded-lg)
- Padding: p-6
- Max-width: max-w-md
- Layout:
  ```
  [Icon - centered, accent color]
  [Title - optional]
  [Message - main text]
  [OK Button - primary, full-width or centered]
  ```

### State Management
```tsx
type Dialog = {
  title?: string;
  message: string;
  type?: 'error' | 'info';
  onClose?: () => void;
}

const [currentDialog, setCurrentDialog] = useState<Dialog | null>(null);
```

## Migration Plan

### Current alert() Usage

| Location | Current Code | New Implementation | Type |
|----------|-------------|-------------------|------|
| LandingPage.tsx:122 | `alert("Please enter your name")` | `dialog.error(...)` or inline validation | Dialog |
| LandingPage.tsx:130 | `alert("Please enter a session ID")` | `dialog.error(...)` or inline validation | Dialog |
| SessionPage.tsx:163 | `alert("Please enter your name")` | `dialog.error(...)` or inline validation | Dialog |
| SessionPage.tsx:167 | `alert("Invalid session ID")` | `dialog.error(..., { onClose: () => navigate('/') })` | Dialog + Navigation |
| SessionPage.tsx:182 | `alert("Session ID copied!")` | `toast.success(...)` | Toast |
| SessionPage.tsx:185 | `alert("Failed to copy. Session ID: ...")` | `dialog.error(...)` | Dialog |
| SessionContext.tsx:138 | `alert(data.message)` | `dialog.error(...)` or `toast.info(...)` | Context-dependent |

### Setup in App.tsx

```tsx
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <SessionProvider>
        {/* Existing app content */}
      </SessionProvider>
    </NotificationProvider>
  );
}
```

### Example Replacements

**Toast (Success):**
```tsx
// Before
alert("Session ID copied to clipboard!");

// After
const { toast } = useNotification();
toast.success("Session ID copied to clipboard!");
```

**Dialog (Error with Navigation):**
```tsx
// Before
alert("Invalid session ID");

// After
const { dialog } = useNotification();
dialog.error("Invalid session ID", {
  onClose: () => navigate('/')
});
```

**Dialog (Error with Details):**
```tsx
// Before
alert(`Failed to copy. Session ID: ${sessionId}`);

// After
const { dialog } = useNotification();
dialog.error(`Failed to copy. Session ID: ${sessionId}`);
```

## Future Enhancements

### Inline Validation
Replace "Please enter..." dialogs with inline form validation:
- Show error state on input field
- Display error message below field
- Better UX than blocking dialog for simple validation

### Toast Variants
- Warning type (yellow/orange accent)
- Loading/progress type

### Dialog Variants
- Confirmation dialogs (OK/Cancel)
- Custom actions beyond just OK

## Implementation Order

1. Install dependencies (`@radix-ui/react-toast`, `@radix-ui/react-dialog`)
2. Create `NotificationContext.tsx` with provider and hooks
3. Create `Toast.tsx` and `ToastContainer.tsx` components
4. Create `Dialog.tsx` and `DialogContainer.tsx` components
5. Wrap app with `NotificationProvider` in `App.tsx`
6. Replace `alert()` calls systematically (start with SessionPage.tsx)
7. Test all notification scenarios
8. (Optional) Implement inline validation for form fields
