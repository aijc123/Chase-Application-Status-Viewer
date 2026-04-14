import { describe, expect, it } from 'vitest';
import { classifyScanError, getScanFeedback } from '../../scanFeedback';

describe('scan feedback mapping', () => {
  it('maps wrong site errors to a site-specific recovery message', () => {
    const feedback = getScanFeedback(classifyScanError('Wrong Site. Go to Chase.com Application Status page.'));

    expect(feedback.type).toBe('wrong_site');
    expect(feedback.title).toMatch(/Chase status page/i);
    expect(feedback.showGuide).toBe(false);
  });

  it('maps not found errors to manual-guide recovery', () => {
    const feedback = getScanFeedback(classifyScanError('NOT_FOUND'));

    expect(feedback.type).toBe('not_found');
    expect(feedback.showGuide).toBe(true);
    expect(feedback.nextSteps.join(' ')).toMatch(/manual json/i);
  });

  it('maps permission failures to script permission guidance', () => {
    const feedback = getScanFeedback(classifyScanError('Cannot access contents of url "https://www.chase.com". Extension manifest must request permission.'));

    expect(feedback.type).toBe('script_permission');
    expect(feedback.message).toMatch(/blocked/i);
    expect(feedback.showGuide).toBe(true);
  });

  it('maps fetch failures to refresh-and-retry guidance', () => {
    const feedback = getScanFeedback(classifyScanError('FETCH_FAILED'));

    expect(feedback.type).toBe('fetch_failed');
    expect(feedback.nextSteps[0]).toMatch(/refresh/i);
  });

  it('falls back to unknown guidance for unexpected failures', () => {
    const feedback = getScanFeedback(classifyScanError('Something odd happened'));

    expect(feedback.type).toBe('unknown');
    expect(feedback.showGuide).toBe(true);
  });
});
