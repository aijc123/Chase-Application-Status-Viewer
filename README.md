# Chase Application Status Viewer

An unofficial browser extension that helps surface detailed Chase application status data from the browser session. It is designed for local use and does not require packet-capture tools.

## What It Does

- Detects Chase application status API responses from the current tab when available.
- Accepts pasted JSON as a manual fallback.
- Highlights application status, reference identifiers, required actions, and document requests.
- Stores parsed results locally so the popup can reopen without re-pasting data.

## Installation

1. Download the latest release zip from the repository releases page.
2. Extract the archive.
3. Open `chrome://extensions` in a Chromium-based browser.
4. Enable Developer mode.
5. Click `Load unpacked` and choose the extracted folder that contains `manifest.json`.

## How To Use

### Automatic Scan

1. Open the Chase application status page.
2. Refresh the page so the status request is present in the tab session.
3. Open the extension popup.
4. Click `One-Click Scan`.

If the scan succeeds, the popup will render the detected application data immediately.

### Manual JSON Fallback

1. Open Developer Tools with `F12`.
2. Go to the `Network` tab.
3. Refresh the Chase status page.
4. Filter requests by `status`.
5. Open the matching response and copy the JSON body.
6. Paste the JSON into the popup and click `Parse JSON`.

## Development

Install dependencies and run the standard scripts:

```bash
npm install
npm test
npm run build
```

## Release Process

Push a version tag in the format `vX.Y.Z` to trigger the release workflow. A successful run will:

1. Verify the tag version matches both `package.json` and `public/manifest.json`.
2. Run `npm ci`, `npm test`, and `npm run build`.
3. Create `chase-status-viewer.zip`.
4. Create a GitHub Release with the zip attached.
5. Upload and publish the same package to the Chrome Web Store.

Before tagging a release, configure these GitHub Actions secrets in the repository:

- `CHROME_EXTENSION_ID`
- `CHROME_CLIENT_ID`
- `CHROME_CLIENT_SECRET`
- `CHROME_REFRESH_TOKEN`

If any validation or Chrome Web Store step fails, the release workflow fails so the repository does not report a misleading partial publish.

## Notes

- Data is processed locally in the browser popup or extension context.
- This project is unofficial and is not affiliated with JPMorgan Chase & Co.
- Update notifications are based on GitHub releases for this repository.
