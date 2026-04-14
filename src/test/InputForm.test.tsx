import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { InputForm } from '../../components/InputForm';
import { MANUAL_GUIDE_PREFERENCE_KEY } from '../../scanFeedback';
import type { ChaseApplicationData } from '../../types';

const validScanResponse: ChaseApplicationData = {
  productApplicationIdentifier: 'app-123',
  cardAccountStatus: [
    {
      productCode: '080',
      subProductCode: '01',
      productApplicationStatusCode: 'APPROVED',
      productApplicationStatusChangeTimestamp: '2026-04-14T12:00:00Z',
      capturedApplicationIdentifier: 'capture-1',
    },
  ],
};

function installChromeMock(url: string, result: unknown = { result: validScanResponse }) {
  const query = vi.fn().mockResolvedValue([{ id: 7, url }]);
  const executeScript = vi.fn().mockResolvedValue([{ result }]);

  Object.defineProperty(globalThis, 'chrome', {
    configurable: true,
    value: {
      tabs: { query },
      scripting: { executeScript },
    },
  });

  return { query, executeScript };
}

describe('InputForm', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    delete (globalThis as { chrome?: unknown }).chrome;
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

  it('accepts scans from real Chase hosts', async () => {
    const onDataParsed = vi.fn();
    const { executeScript } = installChromeMock('https://secure.chase.com/web/auth/app/status');

    render(<InputForm onDataParsed={onDataParsed} />);
    fireEvent.click(screen.getByRole('button', { name: /scan the current chase status page/i }));

    await waitFor(() => {
      expect(executeScript).toHaveBeenCalledTimes(1);
      expect(onDataParsed).toHaveBeenCalledWith([validScanResponse]);
    });
  });

  it('rejects lookalike hosts before attempting to script the page', async () => {
    const onDataParsed = vi.fn();
    const { executeScript } = installChromeMock('https://chase.com.evil.example/status');

    render(<InputForm onDataParsed={onDataParsed} />);
    fireEvent.click(screen.getByRole('button', { name: /scan the current chase status page/i }));

    expect(await screen.findByText('Open the Chase status page')).toBeInTheDocument();
    expect(executeScript).not.toHaveBeenCalled();
    expect(onDataParsed).not.toHaveBeenCalled();
  });
});
