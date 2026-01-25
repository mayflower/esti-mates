import * as RadixDialog from '@radix-ui/react-dialog';
import { FiXCircle, FiInfo } from 'react-icons/fi';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes } from 'styled-components';

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

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const Overlay = styled(RadixDialog.Overlay)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 50;

  &[data-state="open"] {
    animation: ${fadeIn} 150ms ease-out;
  }
`;

const Content = styled(RadixDialog.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 1.5rem;
  width: 100%;
  max-width: 28rem;
  z-index: 50;

  &[data-state="open"] {
    animation: ${scaleIn} 150ms ease-out;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
`;

const IconWrapper = styled.div<{ $type: 'error' | 'info' }>`
  width: 48px;
  height: 48px;
  color: ${p => p.$type === 'error' ? p.theme.colors.error : p.theme.colors.primary};
`;

const Title = styled(RadixDialog.Title)`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${p => p.theme.colors.text};
  margin: 0;
`;

const Description = styled(RadixDialog.Description)`
  font-size: 0.875rem;
  color: ${p => p.theme.colors.textSecondary};
  margin: 0;
`;

const OkButton = styled.button`
  margin-top: 0.5rem;
  width: 100%;
  background-color: ${p => p.theme.colors.primary};
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 150ms;

  &:hover {
    opacity: 0.9;
  }
`;

export function Dialog({ title, message, type = 'info', onClose }: DialogProps) {
  const intl = useIntl();
  const Icon = iconMap[type];
  const defaultTitle = type === 'error'
    ? intl.formatMessage({ id: 'dialog.error' })
    : intl.formatMessage({ id: 'dialog.info' });

  return (
    <RadixDialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <RadixDialog.Portal>
        <Overlay />
        <Content data-type={type}>
          <ContentWrapper>
            <IconWrapper $type={type}>
              <Icon size={48} />
            </IconWrapper>
            <Title>{title || defaultTitle}</Title>
            <Description>{message}</Description>
            <OkButton onClick={onClose}><FormattedMessage id="dialog.ok" /></OkButton>
          </ContentWrapper>
        </Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
