# Chase Application Status Viewer 🛡️

![Version](https://img.shields.io/github/v/release/YOUR_USERNAME/Chase-Application-Status-Viewer?label=Latest%20Version)
![License](https://img.shields.io/badge/license-MIT-blue)

An unofficial browser extension that reveals the **hidden details** of your Chase Credit Card application status. It helps you find the specific "Decision Engine" codes and reference numbers needed when calling the reconsideration line (Recon).

**🔒 Privacy First:** This tool runs 100% locally in your browser. No data is sent to any external server.

---

## 📥 How to Install (For Everyone)

You do **not** need to be a developer to use this.

### 1. Download
Go to the **[Releases Page](../../releases/latest)** and download the file named **`chase-status-viewer.zip`**.

### 2. Unzip
Locate the downloaded file and **unzip/extract it**. You should now have a folder (usually named `dist` or `chase-status-viewer`) containing files like `index.html` and `manifest.json`.

### 3. Load into Chrome / Edge / Brave
1. Open your browser and type `chrome://extensions` in the address bar.
2. In the top-right corner, turn on the toggle switch for **Developer mode**.
3. Click the button that says **Load unpacked**.
4. Select the folder you just unzipped in Step 2.

*Done! The shield icon should appear in your toolbar.*

---

## 🚀 How to Use

1. **Login to Chase**: Go to [Chase.com](https://www.chase.com) and navigate to the "Application Status" page (usually under the main menu > "Application Status").
2. **Open the Tool**: Click the **Shield Icon** extension in your browser toolbar.
3. **Scan**: Click the blue **"Scan Current Tab"** button.
4. **Analyze**:
   *   **Recon Guide**: If rejected or pending, see exactly which number to call.
   *   **Reference #**: Copy the Decision Engine Reference Identifier to quote to the agent.
   *   **Error Codes**: See detailed internal error codes (e.g., `PEND_CALL_SUPPORT` vs `DECLINED`).

---

## 🛠️ For Developers (Manual Build)

If you want to modify the code or build it yourself:

1.  Clone the repo:
    ```bash
    git clone https://github.com/YOUR_USERNAME/Chase-Application-Status-Viewer.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Build:
    ```bash
    npm run build
    ```
4.  Load the `dist` folder into Chrome as an unpacked extension.

---

## ⚖️ Disclaimer

This software is an unofficial tool built by the community for educational and informational purposes only.
*   It is **not** affiliated with, endorsed by, or connected to JPMorgan Chase & Co.
*   Use at your own risk.
*   Always protect your personal financial information.