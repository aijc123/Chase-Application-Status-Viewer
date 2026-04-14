# v1.0.17 - Release Pipeline Stabilization

## Fixes

- Moved the release workflow to Node 24 so the GitHub runner matches the environment that installs and builds successfully locally.
- Added release diagnostics and npm debug-log printing to make future CI install failures actionable.
- Enforced the expected Chrome Web Store extension ID so releases fail fast if secrets point to the wrong item.

## Improvements

- Switched tag release checkout to a full fetch to avoid shallow-history edge cases.
- Kept the review hardening fixes from `v1.0.15` bundled into the next clean release.

## Verification

- `npm ci`
- `npm test`
- `npm run build`
