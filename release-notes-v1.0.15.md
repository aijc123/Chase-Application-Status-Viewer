# v1.0.15 - Review Hardening Release

## Fixes

- Tightened automatic scan URL validation so the extension only runs on `chase.com` and real `*.chase.com` hosts.
- Validated restored popup data before rendering so malformed saved payloads are discarded instead of breaking the UI state.
- Cleaned up corrupted source and test text artifacts found during review.

## Improvements

- Added targeted tests for scan host validation and startup restore behavior.
- Centralized the saved popup storage key for safer restore and reset handling.

## Verification

- `npm test`
- `npm run build`
