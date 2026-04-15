# v1.0.18 - Verified Artifact Release

## Fixes

- Switched the release workflow to publish a locally verified extension zip instead of rebuilding on GitHub runners that were failing during `npm ci`.
- Added explicit release-artifact validation so the packaged `manifest.json` version must match the release tag before publish starts.
- Kept the public Chrome Web Store extension ID check in place so publishing still fails fast if secrets target the wrong item.

## Improvements

- Release diagnostics now print the target extension ID, ref name, and artifact name before publishing.
- The release process documentation now reflects the local build-and-package flow used for Chrome Web Store publishing.

## Verification

- `npm ci`
- `npm test`
- `npm run build`
- package `dist/` into `chase-status-viewer.zip`
