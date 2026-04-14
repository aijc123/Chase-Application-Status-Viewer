import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Dashboard } from '../../components/Dashboard';
import type { ChaseApplicationData } from '../../types';

vi.mock('../../utils', async () => {
  const actual = await vi.importActual<typeof import('../../utils')>('../../utils');
  return {
    ...actual,
    getTimeAgo: () => '2h ago',
    formatDate: () => '04/14/26',
  };
});

const baseStatus = {
  productCode: '080',
  subProductCode: '01',
  productApplicationStatusCode: 'PEND_REVIEW',
  productApplicationStatusChangeTimestamp: '2026-04-14T12:00:00Z',
};

const reviewApp: ChaseApplicationData = {
  productApplicationIdentifier: 'app-1',
  customerFacingApplicationIdentifier: 'ref-1',
  applicationCreateTimestamp: '2026-04-13T12:00:00Z',
  cardAccountStatus: [
    {
      ...baseStatus,
      statusAdditionalInformation: {
        errors: [{ errorCode: 'E123' }],
        requiredActionList: ['Verify identity'],
      },
      pendRequiredInformation: {
        requiredDocuments: [
          {
            documentCategoryName: 'Identity',
            documentTypeName: ['Passport'],
          },
        ],
      },
      decisionEngineReferenceIdentifier: 'DEC-123',
      capturedApplicationIdentifier: 'cap-1',
    },
  ],
};

const approvedApp: ChaseApplicationData = {
  productApplicationIdentifier: 'app-2',
  applicationCreateTimestamp: '2026-04-12T12:00:00Z',
  depositAccountStatus: [
    {
      productCode: '919',
      subProductCode: '01',
      productApplicationStatusCode: 'APPROVED',
      productApplicationStatusChangeTimestamp: '2026-04-14T11:00:00Z',
    },
  ],
};

describe('Dashboard', () => {
  it('hides technical product codes from the list view', () => {
    render(<Dashboard data={[reviewApp, approvedApp]} onReset={() => undefined} />);

    expect(screen.queryByText(/Code:/i)).not.toBeInTheDocument();
    expect(screen.getByText('2 of 2 Apps')).toBeInTheDocument();
  });

  it('shows disclaimer text for error-code searches', () => {
    render(<Dashboard data={[reviewApp]} onReset={() => undefined} />);

    expect(screen.getByText(/reference-only and may include non-official explanations/i)).toBeInTheDocument();
  });

  it('keeps advanced details collapsed until requested', () => {
    render(<Dashboard data={[reviewApp]} onReset={() => undefined} />);

    expect(screen.getByText('Advanced Details')).toBeInTheDocument();
    expect(screen.queryByText('Raw JSON Data')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /advanced details/i }));

    expect(screen.getByText('Raw JSON Data')).toBeInTheDocument();
    expect(screen.getByText('Product Code')).toBeInTheDocument();
  });
});
