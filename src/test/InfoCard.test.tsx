import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InfoCard } from '../../components/InfoCard';

describe('InfoCard', () => {
  it('renders label and value', () => {
    render(<InfoCard label="Reference #" value="ABC-123" />);
    expect(screen.getByText('Reference #')).toBeInTheDocument();
    expect(screen.getByText('ABC-123')).toBeInTheDocument();
  });

  it('renders subValue when provided', () => {
    render(<InfoCard label="Updated" value="2d ago" subValue="12/25/25" />);
    expect(screen.getByText('12/25/25')).toBeInTheDocument();
  });

  it('does not render copy button when copyable is false', () => {
    render(<InfoCard label="Label" value="Value" />);
    expect(screen.queryByTitle('Copy')).not.toBeInTheDocument();
  });

  it('renders copy button when copyable is true', () => {
    render(<InfoCard label="Label" value="Value" copyable />);
    expect(screen.getByTitle('Copy')).toBeInTheDocument();
  });

  it('copies value to clipboard and shows Copied! feedback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<InfoCard label="Label" value="copy-me" copyable />);
    fireEvent.click(screen.getByTitle('Copy'));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('copy-me');
      expect(screen.getByTitle('Copied!')).toBeInTheDocument();
    });
  });

  it('handles clipboard failure silently', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.assign(navigator, { clipboard: { writeText } });

    render(<InfoCard label="Label" value="copy-me" copyable />);
    fireEvent.click(screen.getByTitle('Copy'));

    // Should not throw, button should remain
    await waitFor(() => {
      expect(screen.getByTitle('Copy')).toBeInTheDocument();
    });
  });

  it('renders tooltip when provided', () => {
    render(<InfoCard label="Label" value="Value" tooltip="Helpful tip" />);
    expect(screen.getByText('Helpful tip')).toBeInTheDocument();
  });
});
