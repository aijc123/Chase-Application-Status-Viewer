# Chase Application Status Viewer / Chase 信用卡申请状态查看器 🛡️

**Current Version: v1.0.2**

**English**: An unofficial browser extension that reveals the **hidden details** of your Chase Credit Card application status. It replaces the need for complex packet capture tools.  
**中文**: 一个非官方的浏览器插件，用于查看 Chase 信用卡申请背后的**详细状态**。它能帮你提取网页上不显示的详细拒信原因、补材料要求和内部状态代码，替代复杂的抓包软件。

---

## 💻 Compatibility / 兼容性

| OS / 系统 | Browsers / 浏览器 | Support / 支持情况 |
| :--- | :--- | :--- |
| **macOS** | Chrome, Edge, Arc, Brave | ✅ **Yes / 支持** |
| **Windows** | Chrome, Edge, Brave | ✅ **Yes / 支持** |
| **Linux** | Chrome, Chromium | ✅ **Yes / 支持** |
| iOS/iPadOS | Safari | ❌ No / 不支持 |

*Note: Safari is not supported. / 注意：不支持 Safari 浏览器。*

---

## 📥 Installation / 安装方法

**Note**: If you have an older version installed, please remove it first.  
**注意**: 如果你之前安装过旧版本，请先移除。

### 1. Download / 下载
Go to the **[Releases Page](../../releases)**.  
Download the file named **`chase-status-viewer.zip`** (Look for v1.0.2 or higher).

前往 **[Releases 页面](../../releases)**，下载名为 **`chase-status-viewer.zip`** 的文件。

### 2. Unzip / 解压
**Unzip/Extract** the downloaded file. You should see a folder containing `manifest.json`.  
**解压** 下载好的压缩包。你会得到一个文件夹，里面包含 `manifest.json` 等文件。

### 3. Load into Browser / 导入浏览器
1.  Open Chrome and go to `chrome://extensions`. (打开扩展程序页面)
2.  **Turn on "Developer mode"** (top-right). (打开右上角开发者模式)
3.  Click **"Load unpacked"** (top-left). (点击加载已解压的扩展程序)
4.  Select the **unzipped folder**. (选择解压后的文件夹)

---

## 🚀 How to Use / 如何使用

### Method 1: Automatic Scan (Easiest)
1.  Go to the Chase Application Status page (where you see "We have received your request" or your list of applications).
2.  **Refresh the page (F5)** to ensure data is loaded.
3.  Click the **Shield Icon** extension.
4.  Click **"Scan Current Tab"**.

### Method 2: Manual F12 (Reliable Fallback)
If the scan fails (due to security settings), follow these steps:
1.  On the Chase status page, press **F12** (or Right Click -> Inspect).
2.  Go to the **Network** tab in the developer tools.
3.  **Refresh the page** (F5 or Cmd+R).
4.  In the filter box, type **`status`**.
5.  Click the row named `status` (or `applications/status`).
6.  Click the **Response** tab.
7.  Copy the entire JSON text.
8.  Paste it into the extension's text box and click **Parse JSON**.

---

## 🔍 What it reveals / 能看到什么？

*   **Recon Number**: The specific department phone number to call for your case. (专线后门电话)
*   **Reference ID**: The internal ID used by the Decision Engine. Quote this to the agent. (内部引用ID，报给客服用)
*   **Detailed Errors**: Why were you actually rejected? (e.g., "Too many accounts opened recently"). (真实的拒信/审核原因)
*   **Required Documents**: Does it show "Unverified DOB"? You just need to upload an ID! (是否只是因为缺材料)

---

## 🔒 Privacy & Disclaimer / 隐私与免责
*   **Local Only**: Data is processed 100% inside your browser. No data is sent to any server.
*   **Unofficial**: Not affiliated with JPMorgan Chase & Co. Use at your own risk.