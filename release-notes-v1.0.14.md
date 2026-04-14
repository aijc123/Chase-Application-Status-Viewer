# v1.0.14 - Chrome Web Store Update UX Fix

## Fixes

- Removed the in-app GitHub update banner that implied users should manually download updates.
- Restored the expected Chrome extension update path so Chrome Web Store installs rely on silent automatic updates.
- Removed the unused `api.github.com` host permission after deleting the release-check banner.

## Improvements

- Added footer links to the Chrome Web Store listing and the GitHub repository.
- Simplified the popup so update messaging better matches real extension behavior.

## Verification

- `npm test`
- `npm run build`
