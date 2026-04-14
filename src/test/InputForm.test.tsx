import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { InputForm } from '../../components/InputForm';
import { MANUAL_GUIDE_PREFERENCE_KEY } from '../../scanFeedback';

describe('InputForm', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the manual JSON guide by default on first visit', () => {
    render(<InputForm onDataParsed={vi.fn()} />);

    expect(screen.getByText('If scanning fails, follow these steps:')).toBeInTheDocument();
  });

  it('restores the saved guide preference from local storage', () => {
    localStorage.setItem(MANUAL_GUIDE_PREFERENCE_KEY, 'false');

    render(<InputForm onDataParsed={vi.fn()} />);

    expect(screen.queryByText('If scanning fails, follow these steps:')).not.toBeInTheDocument();
  });

  it('persists guide visibility when the user toggles it', () => {
    render(<InputForm onDataParsed={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /how to get json manually/i }));

    expect(localStorage.getItem(MANUAL_GUIDE_PREFERENCE_KEY)).toBe('false');
  });
});
