import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocumentStatus } from '../../components/DocumentStatus';

describe('DocumentStatus', () => {
  it('uses conservative copy when no actions or documents exist', () => {
    render(<DocumentStatus />);

    expect(screen.getByText('No pending items detected')).toBeInTheDocument();
    expect(screen.getByText(/official Chase status page, email, or text notifications/i)).toBeInTheDocument();
  });

  it('shows required actions and documents without the no-pending copy', () => {
    render(
      <DocumentStatus
        actionList={['Upload proof of income']}
        pendInfo={{
          requiredDocuments: [
            {
              documentCategoryName: 'Identity',
              documentTypeName: ['Driver license'],
            },
          ],
        }}
      />
    );

    expect(screen.getByText('What To Do Next')).toBeInTheDocument();
    expect(screen.getByText('Upload proof of income')).toBeInTheDocument();
    expect(screen.getByText('Driver license')).toBeInTheDocument();
    expect(screen.queryByText('No pending items detected')).not.toBeInTheDocument();
  });
});
