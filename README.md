# Chase Application Status Viewer (Unofficial)

A secure, client-side tool to visualize the hidden JSON status details of your Chase Credit Card applications. This tool helps identify rejection reasons, recon reference numbers, and status timestamps that aren't visible on the main webpage.

## Features

- **One-Click Scan**: Automatically detects application status JSON from your active Chase tab.
- **Detailed Insights**: Decodes internal status codes (e.g., `PEND_CALL_SUPPORT`).
- **Recon Helpers**: Shows Decision Engine Reference IDs and specific error codes for calling reconsideration lines.
- **Privacy First**: Runs 100% locally in your browser. No data is sent to any analytics or 3rd party server.
- **Persistence**: Remembers your last scanned status even if you close the extension popup.

## Installation (Chrome/Edge/Brave)

Since this is a developer tool, you can install it manually:

1.  **Download & Build**:
    *   Clone this repository.
    *   Run `npm install` then `npm run build`.
    *   This creates a `dist` folder.

2.  **Load into Chrome**:
    *   Open Chrome and navigate to `chrome://extensions`.
    *   Enable **Developer mode** (toggle in the top-right corner).
    *   Click the **Load unpacked** button.
    *   Select the `dist` folder you just created.

3.  **Usage**:
    *   Log in to your Chase account and go to the "Application Status" page.
    *   Click the **Shield Icon** in your browser toolbar.
    *   Click **"Scan Current Tab"**.

## Manual Usage (Web Version)

If you prefer not to install the extension:
1.  Open the web version (or run locally via `npm run dev`).
2.  On Chase.com, press `F12` to open Developer Tools.
3.  Go to the **Network** tab.
4.  Filter by `status`.
5.  Refresh the page.
6.  Click the request that looks like `.../applications/{UUID}/status`.
7.  Copy the **Response** JSON.
8.  Paste it into the viewer.

## Privacy Policy

This software is open source. It does not collect, store, or transmit any personal information. All processing happens within your browser instance.

**Disclaimer**: This is an unofficial tool built by the community. It is not affiliated with, endorsed by, or connected to JPMorgan Chase & Co. Use at your own risk.
