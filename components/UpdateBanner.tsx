import React, { useEffect, useState } from 'react';
import { Download, X, Sparkles } from 'lucide-react';

// Declare chrome global
declare var chrome: any;

// ⚠️ IMPORTANT: Change this to your actual GitHub "User/Repo"
// Example: "lemo-cor/chase-status-viewer"
const GITHUB_REPO = "YOUR_GITHUB_USER/YOUR_REPO_NAME"; 

export const UpdateBanner: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<{ hasUpdate: boolean; version: string; url: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkUpdate = async () => {
      // Skip if generic placeholder is still there to avoid 404s
      if (GITHUB_REPO.includes("YOUR_GITHUB_USER")) return;

      try {
        // 1. Get current version
        const currentVersion = typeof chrome !== 'undefined' && chrome.runtime?.getManifest 
          ? chrome.runtime.getManifest().version 
          : '1.0.3'; // Fallback for dev

        // 2. Fetch latest release from GitHub API
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
        if (!response.ok) return;
        
        const data = await response.json();
        const latestVersionTag = data.tag_name; // e.g., "v1.0.4"
        const latestVersion = latestVersionTag.replace(/^v/, '');
        
        // 3. Compare versions
        if (compareVersions(latestVersion, currentVersion) > 0) {
          setUpdateInfo({
            hasUpdate: true,
            version: latestVersion,
            url: data.html_url // Link to the release page
          });
        }
      } catch (e) {
        console.error("Failed to check for updates", e);
      }
    };

    checkUpdate();
  }, []);

  if (!updateInfo || !updateInfo.hasUpdate || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 shadow-md relative animate-in slide-in-from-top-2">
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-2.5">
            <div className="bg-white/20 p-1.5 rounded-full mt-0.5">
                <Sparkles className="w-4 h-4 text-yellow-300" />
            </div>
            <div>
                <h3 className="text-xs font-bold text-white mb-0.5">Update Available: v{updateInfo.version}</h3>
                <p className="text-[10px] text-indigo-100 leading-tight mb-2">
                    A newer version is available on GitHub.
                </p>
                <a 
                    href={updateInfo.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 bg-white text-indigo-700 px-2 py-1 rounded text-[10px] font-bold hover:bg-indigo-50 transition-colors"
                >
                    <Download className="w-3 h-3" />
                    Download Update
                </a>
            </div>
        </div>
        <button 
            onClick={() => setDismissed(true)}
            className="text-indigo-200 hover:text-white transition-colors"
        >
            <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Helper: Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const n1 = parts1[i] || 0;
    const n2 = parts2[i] || 0;
    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }
  return 0;
}