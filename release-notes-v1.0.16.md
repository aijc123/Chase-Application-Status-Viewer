# v1.0.16 - Release Pipeline Repair

## Fixes

- Added release workflow diagnostics so GitHub Actions now prints tool versions and npm debug logs when install fails.
- Enforced the expected Chrome Web Store extension ID in release validation so publishing fails fast if secrets target the wrong item.
- Kept the review hardening fixes from `v1.0.15` ready for republish through a clean tag.

## Improvements

- Switched checkout to a full fetch during tag releases to avoid shallow-history edge cases.
- Upgraded the install step to verbose `npm ci` output for easier CI debugging.

## Verification

- `npm ci`
- `npm test`
- `npm run build`
