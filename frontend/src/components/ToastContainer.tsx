import * as RadixToast from '@radix-ui/react-toast';
import styled from 'styled-components';
import { Toast as ToastComponent } from './Toast';
import { Toast } from '../contexts/NotificationContext';

const StyledViewport = styled(RadixToast.Viewport)`
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 390px;
  max-width: calc(100vw - 2rem);
  z-index: 50;
  outline: none;
`;

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
      <StyledViewport />
    </RadixToast.Provider>
  );
}
