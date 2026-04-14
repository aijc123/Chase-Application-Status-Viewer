import packageJson from './package.json';

export function getCurrentVersion(): string {
  if (typeof chrome !== 'undefined' && chrome.runtime?.getManifest) {
    return chrome.runtime.getManifest().version;
  }

  return packageJson.version;
}
