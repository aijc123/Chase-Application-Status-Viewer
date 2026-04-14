export type ScanErrorType =
  | 'wrong_site'
  | 'no_active_tab'
  | 'not_found'
  | 'script_permission'
  | 'fetch_failed'
  | 'unknown';

export interface ScanFeedback {
  type: ScanErrorType;
  title: string;
  message: string;
  nextSteps: string[];
  showGuide: boolean;
}

export const MANUAL_GUIDE_PREFERENCE_KEY = 'chaseStatusManualGuideExpanded';

export function classifyScanError(message?: string): ScanErrorType {
  const normalized = (message || '').toLowerCase();

  if (normalized.includes('wrong site')) return 'wrong_site';
  if (normalized.includes('no active tab')) return 'no_active_tab';
  if (normalized.includes('not_found')) return 'not_found';

  if (
    normalized.includes('cannot access') ||
    normalized.includes('cannot be scripted') ||
    normalized.includes('missing host permission') ||
    normalized.includes('permission') ||
    normalized.includes('extensions gallery')
  ) {
    return 'script_permission';
  }

  if (
    normalized.includes('fetch_failed') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('networkerror') ||
    normalized.includes('the message port closed')
  ) {
    return 'fetch_failed';
  }

  return 'unknown';
}

export function getScanFeedback(type: ScanErrorType): ScanFeedback {
  switch (type) {
    case 'wrong_site':
      return {
        type,
        title: 'Open the Chase status page',
        message: 'Automatic scan only works on the Chase Application Status page.',
        nextSteps: [
          'Go to the Chase Application Status page in your current tab.',
          'Refresh the page once so the latest status request loads.',
          'Open the extension again and try One-Click Scan.',
        ],
        showGuide: false,
      };
    case 'no_active_tab':
      return {
        type,
        title: 'No active tab found',
        message: 'The popup could not find a page to scan right now.',
        nextSteps: [
          'Return to the Chase status page tab.',
          'Open the extension from that tab and try again.',
        ],
        showGuide: false,
      };
    case 'not_found':
      return {
        type,
        title: 'Status data was not found automatically',
        message: 'The page did not expose a usable status response for automatic scan yet.',
        nextSteps: [
          'Refresh the Chase status page and wait for it to finish loading.',
          'Try One-Click Scan again.',
          'If it still fails, use the manual JSON steps below.',
        ],
        showGuide: true,
      };
    case 'script_permission':
      return {
        type,
        title: 'The page could not be scanned',
        message: 'Chrome blocked the popup from reading this tab.',
        nextSteps: [
          'Refresh the Chase page, then reopen the extension popup.',
          'Make sure the extension is allowed to run on chase.com.',
          'If needed, use the manual JSON steps below.',
        ],
        showGuide: true,
      };
    case 'fetch_failed':
      return {
        type,
        title: 'The status request could not be read',
        message: 'The page may not have loaded the status request completely, or the request could not be fetched again.',
        nextSteps: [
          'Refresh the Chase status page and wait for it to finish loading.',
          'Try One-Click Scan again.',
          'If the request still cannot be read, use the manual JSON steps below.',
        ],
        showGuide: true,
      };
    case 'unknown':
    default:
      return {
        type: 'unknown',
        title: 'Scan did not finish',
        message: 'Something unexpected interrupted the automatic scan.',
        nextSteps: [
          'Refresh the Chase status page and reopen the popup.',
          'Try One-Click Scan again.',
          'If it still fails, use the manual JSON steps below.',
        ],
        showGuide: true,
      };
  }
}
