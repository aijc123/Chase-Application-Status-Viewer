import { ChaseApplicationData } from './types';

export function formatDate(isoString?: string): string {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: '2-digit' });
}

export function getTimeAgo(isoString?: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  if (diff < 0) return 'just now';
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${minutes}m ago`;
}

export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const n1 = parts1[i] || 0;
    const n2 = parts2[i] || 0;
    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }
  return 0;
}

export function isValidChaseData(parsed: unknown): boolean {
  const items = Array.isArray(parsed) ? parsed : [parsed];
  return (items as ChaseApplicationData[]).some(item =>
    item.productApplicationIdentifier && (
      ((item.cardAccountStatus as unknown[])?.length ?? 0) > 0 ||
      ((item.enrollmentProductStatus as unknown[])?.length ?? 0) > 0 ||
      ((item.depositAccountStatus as unknown[])?.length ?? 0) > 0 ||
      ((item.lendingAccountStatus as unknown[])?.length ?? 0) > 0 ||
      ((item.investmentAccountStatus as unknown[])?.length ?? 0) > 0
    )
  );
}