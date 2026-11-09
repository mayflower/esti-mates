import type { Dialog } from "../contexts/NotificationContext";
import { Dialog as DialogComponent } from "./Dialog";

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
