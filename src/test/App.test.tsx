import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../../App';
import { CHASE_STATUS_STORAGE_KEY } from '../../utils';
import type { ChaseApplicationData } from '../../types';

vi.mock('../../components/InputForm', () => ({
  InputForm: () => <div>Input Form Mock</div>,
}));

vi.mock('../../components/Dashboard', () => ({
  Dashboard: ({ data }: { data: ChaseApplicationData[] }) => (
    <div>Dashboard Mock {data[0]?.productApplicationIdentifier}</div>
  ),
}));

vi.mock('../../version', () => ({
  getCurrentVersion: () => '1.0.15',
}));

const validStoredData: ChaseApplicationData[] = [
  {
    productApplicationIdentifier: 'restored-app',
    cardAccountStatus: [
      {
        productCode: '080',
        subProductCode: '01',
        productApplicationStatusCode: 'APPROVED',
        productApplicationStatusChangeTimestamp: '2026-04-14T12:00:00Z',
        capturedApplicationIdentifier: 'capture-1',
      },
    ],
  },
];

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    delete (globalThis as { chrome?: unknown }).chrome;
  });

  it('restores valid data from local storage', async () => {
    localStorage.setItem(CHASE_STATUS_STORAGE_KEY, JSON.stringify(validStoredData));

    render(<App />);

    expect(await screen.findByText('Dashboard Mock restored-app')).toBeInTheDocument();
  });

  it('drops invalid data from local storage and stays on the input form', async () => {
    localStorage.setItem(CHASE_STATUS_STORAGE_KEY, JSON.stringify([{ productApplicationIdentifier: 'bad' }]));

    render(<App />);

    expect(await screen.findByText('Input Form Mock')).toBeInTheDocument();
    expect(localStorage.getItem(CHASE_STATUS_STORAGE_KEY)).toBeNull();
  });

  it('drops invalid data from chrome storage before rendering', async () => {
    const get = vi.fn((_keys: string[], callback: (result: Record<string, unknown>) => void) => {
      callback({ [CHASE_STATUS_STORAGE_KEY]: [{ productApplicationIdentifier: 'bad' }] });
    });
    const remove = vi.fn();

    Object.defineProperty(globalThis, 'chrome', {
      configurable: true,
      value: {
        storage: {
          local: {
            get,
            remove,
          },
        },
      },
    });

    render(<App />);

    expect(await screen.findByText('Input Form Mock')).toBeInTheDocument();
    await waitFor(() => {
      expect(remove).toHaveBeenCalledWith([CHASE_STATUS_STORAGE_KEY]);
    });
  });
});
