import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConnectButton from '../../src/components/ConnectButton';

// Mock the Para SDK components
const mockOpenModal = vi.fn();

const mockUseModal = vi.fn().mockReturnValue({
  openModal: mockOpenModal,
  closeModal: vi.fn(),
  isOpen: false,
});

vi.mock('@getpara/react-sdk', () => ({
  useModal: () => mockUseModal(),
}));

// Mock the Button component
vi.mock('../../src/components/base/Button', () => ({
  default: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('ConnectButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render login button', async () => {
      render(<ConnectButton />);

      // Wait for OAuth methods to load and component to stabilize
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
      });
    });

    it('should call openModal when clicked', async () => {
      render(<ConnectButton />);

      // Wait for OAuth methods to load
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      // Click the button to open modal
      const user = userEvent.setup();
      await user.click(screen.getByRole('button'));

      expect(mockOpenModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have accessible button', async () => {
      render(<ConnectButton />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /log in/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('Log in');
      });
    });

    it('should be keyboard accessible', async () => {
      render(<ConnectButton />);

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const button = screen.getByRole('button');

      // Focus the button with keyboard
      await user.tab();
      expect(button).toHaveFocus();

      // Activate with Enter key
      await user.keyboard('{Enter}');

      expect(mockOpenModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration behavior', () => {
    it('should properly clean up after component unmount', async () => {
      const { unmount } = render(<ConnectButton />);

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole('button'));

      expect(mockOpenModal).toHaveBeenCalledTimes(1);

      // Unmount component
      unmount();

      // Verify cleanup
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
