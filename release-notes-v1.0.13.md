# v1.0.13 - Validation Hardening and Docs Refresh

## Fixes

- Hardened Chase JSON validation so malformed payload shapes no longer pass as valid application data.
- Reused the shared validation helper in both manual paste and One-Click Scan flows to keep behavior consistent.
- Reused the shared version comparison helper in the update banner to remove duplicate release logic.

## Improvements

- Added regression tests for malformed status fields and blank application identifiers.
- Refreshed the README to remove stale version-specific instructions and unreadable text encoding artifacts.

## Verification

- `npm test`
- `npm run build`
