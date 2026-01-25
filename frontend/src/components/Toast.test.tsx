import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as RadixToast from '@radix-ui/react-toast';
import { Toast } from './Toast';

function renderToast(props: Parameters<typeof Toast>[0]) {
  return render(
    <RadixToast.Provider>
      <Toast {...props} />
      <RadixToast.Viewport />
    </RadixToast.Provider>
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
