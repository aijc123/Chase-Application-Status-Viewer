# Chase Application Status Viewer — Claude Guide

## Project Overview

A **Chrome Manifest V3 extension** that intercepts and parses Chase credit card application status API responses, surfacing hidden rejection reasons, document requirements, and internal reference IDs that Chase's UI doesn't show.

All data processing is **100% local** — nothing leaves the browser.

## Tech Stack

- **React 18** + **TypeScript** + **Tailwind CSS**
- **Vite 5** (build tool)
- **Chrome Extension APIs**: `chrome.scripting`, `chrome.storage.local`, `activeTab`
- **Target**: Chromium-based browsers (Chrome, Edge, Brave, Arc)

## Project Structure

```
/
├── index.tsx               # React entry point
├── App.tsx                 # Root component, chrome.storage hydration
├── types.ts                # TypeScript interfaces for Chase API shape
├── components/
│   ├── InputForm.tsx       # Core logic: scan tab or paste JSON
│   ├── Dashboard.tsx       # Status display, product detection, filtering
│   ├── DocumentStatus.tsx  # Required documents list
│   ├── InfoCard.tsx        # Reusable info row with copy button
│   ├── RawViewer.tsx       # Collapsible raw JSON debug viewer
│   └── UpdateBanner.tsx    # GitHub release version check
├── public/manifest.json    # Extension manifest (MV3)
├── .claude/launch.json     # Dev server configs for Claude Code preview
└── vite.config.ts          # Vite config (base: './' for extension popup)
```

## Development Commands

```bash
npm install        # Install dependencies
npm run dev        # Vite dev server → http://localhost:5173
npm run build      # TypeScript check + production build → dist/
npm run preview    # Serve dist/ → http://localhost:4173
```

## Loading the Extension in Chrome

1. Run `npm run build` to generate `dist/`
2. Open `chrome://extensions`
3. Enable **Developer mode** (top-right)
4. Click **Load unpacked** → select the `dist/` folder

## Key Architecture Notes

**How scanning works** (`InputForm.tsx`):
1. **Strategy 1 — Log scan**: Uses `performance.getEntriesByType("resource")` via `chrome.scripting.executeScript` to find the exact Chase API URL already fetched by the page, then re-fetches it with the required headers.
2. **Strategy 2 — Blind fetch**: Falls back to trying 4 hardcoded endpoint versions (`/origination-api/v1-v4/applications/status`).
3. **Manual fallback**: User pastes JSON from DevTools → Network → Response tab.

**Required fetch headers** (Chase API won't respond without these):
```js
{ 'x-jpmc-csrf-token': 'NONE', 'x-jpmc-channel': 'id=ci', 'Accept': 'application/json' }
```

**Product detection** (`Dashboard.tsx`): Identifies product type (Credit Card / Bank Account / Loan) by product code prefix: `080` = Credit Card, `9xx` = Bank Account, `7xx` = Loan.

**Data persistence**: Parsed results are stored in `chrome.storage.local` (key: `chaseStatusDataArray`) so they survive popup close/reopen.

## Known Issues

None at this time. All issues from the initial code review have been resolved in v1.0.5.

## What NOT to Do

- Do not add server-side components — the extension must remain fully local/offline-capable.
- Do not change `base: './'` in `vite.config.ts` — extension popups require relative asset paths.
- Do not remove the `x-jpmc-csrf-token: 'NONE'` header — Chase's API requires it from extension context.
- Do not split the build output into multiple HTML files — the extension popup entry must stay `index.html`.
