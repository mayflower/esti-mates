import * as RadixToast from '@radix-ui/react-toast';
import { FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';
import styled, { keyframes } from 'styled-components';
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
  success: { border: '#22c55e', text: '#15803d' },
  error: { border: '#ef4444', text: '#b91c1c' },
  info: { border: '#3b82f6', text: '#1e40af' },
};

const slideIn = keyframes`
  from { transform: translateX(calc(100% + 1rem)); }
  to { transform: translateX(0); }
`;

const slideOut = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(calc(100% + 1rem)); }
`;

const swipeOut = keyframes`
  from { transform: translateX(var(--radix-toast-swipe-end-x)); }
  to { transform: translateX(calc(100% + 1rem)); }
`;

const StyledToastRoot = styled(RadixToast.Root)<{ $type: ToastType }>`
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${p => colorMap[p.$type].border};
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 300px;
  max-width: 500px;

  &[data-state="open"] { animation: ${slideIn} 150ms cubic-bezier(0.16, 1, 0.3, 1); }
  &[data-state="closed"] { animation: ${slideOut} 100ms ease-in; }
  &[data-swipe="move"] { transform: translateX(var(--radix-toast-swipe-move-x)); }
  &[data-swipe="cancel"] { transform: translateX(0); transition: transform 200ms ease-out; }
  &[data-swipe="end"] { animation: ${swipeOut} 100ms ease-out; }
`;

const IconWrapper = styled.div<{ $type: ToastType }>`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: ${p => colorMap[p.$type].text};
`;

const Message = styled(RadixToast.Description)`
  flex: 1;
  font-size: 0.875rem;
  color: #1f2937;
`;

const CloseButton = styled(RadixToast.Close)`
  flex-shrink: 0;
  padding: 0.25rem;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background-color 150ms;
  &:hover { background-color: #f3f4f6; }
`;

const CloseIcon = styled(FiX)`
  width: 16px;
  height: 16px;
  color: #6b7280;
`;

export function Toast({ id, message, type, onClose }: ToastProps) {
  const Icon = iconMap[type];
  return (
    <StyledToastRoot $type={type} data-type={type}>
      <IconWrapper $type={type}><Icon /></IconWrapper>
      <Message>{message}</Message>
      <CloseButton aria-label="Close notification" onClick={() => onClose(id)}>
        <CloseIcon />
      </CloseButton>
    </StyledToastRoot>
  );
}
