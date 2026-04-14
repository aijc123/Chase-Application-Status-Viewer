import React, { useState, useEffect, Component } from 'react';
import { ChaseApplicationData } from './types';
import { InputForm } from './components/InputForm';
import { Dashboard } from './components/Dashboard';
import { ExternalLink, Github, ShieldCheck } from 'lucide-react';
import { getCurrentVersion } from './version';
import { CHASE_STATUS_STORAGE_KEY, isValidChaseData } from './utils';

const GITHUB_REPO_URL = 'https://github.com/aijc123/Chase-Application-Status-Viewer';
const CHROME_WEB_STORE_URL = 'https://chromewebstore.google.com/detail/chase-application-status/lljgnhhealbjbnenmmidncipmgbahggh';

function restorePersistedData(candidate: unknown): ChaseApplicationData[] | null {
  if (!candidate || !isValidChaseData(candidate)) {
    return null;
  }

  return Array.isArray(candidate)
    ? (candidate as ChaseApplicationData[])
    : [candidate as ChaseApplicationData];
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
          <ShieldCheck className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-sm font-semibold text-gray-700 mb-1">Something went wrong</p>
          <p className="text-xs text-gray-400">Try closing and reopening the popup.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [data, setData] = useState<ChaseApplicationData[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([CHASE_STATUS_STORAGE_KEY], (result: { [key: string]: unknown }) => {
        const restored = restorePersistedData(result[CHASE_STATUS_STORAGE_KEY]);
        if (restored) {
          setData(restored);
        } else if (result[CHASE_STATUS_STORAGE_KEY]) {
          chrome.storage.local.remove([CHASE_STATUS_STORAGE_KEY]);
        }
        setLoading(false);
      });
    } else {
      const localData = localStorage.getItem(CHASE_STATUS_STORAGE_KEY);
      if (localData) {
        try {
          const restored = restorePersistedData(JSON.parse(localData));
          if (restored) {
            setData(restored);
          } else {
            localStorage.removeItem(CHASE_STATUS_STORAGE_KEY);
          }
        } catch {
          localStorage.removeItem(CHASE_STATUS_STORAGE_KEY);
        }
      }
      setLoading(false);
    }
  }, []);

  const handleSetData = (newData: ChaseApplicationData[]) => {
    setData(newData);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [CHASE_STATUS_STORAGE_KEY]: newData });
    } else {
      localStorage.setItem(CHASE_STATUS_STORAGE_KEY, JSON.stringify(newData));
    }
  };

  const handleReset = () => {
    setData(null);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove([CHASE_STATUS_STORAGE_KEY]);
    } else {
      localStorage.removeItem(CHASE_STATUS_STORAGE_KEY);
    }
  };

  if (loading) {
      return <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">Loading...</div>;
  }

  return (
    <ErrorBoundary>
    <div className="min-h-full flex flex-col font-sans text-sm">
      {/* Header - Compact */}
      <header className="bg-chase-navy text-white shadow-md sticky top-0 z-50">
        <div className="px-3 h-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-chase-blue bg-white rounded-full p-0.5" />
            <h1 className="text-sm font-bold tracking-tight">Chase Status</h1>
          </div>
          <div className="text-[10px] text-gray-300">
            v{getCurrentVersion()}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow bg-gray-50 p-3 overflow-y-auto">
        <div className="mx-auto">
          {!data ? (
            <InputForm onDataParsed={handleSetData} />
          ) : (
            <Dashboard data={data} onReset={handleReset} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="px-3 py-2 space-y-1.5">
          <div className="flex items-center justify-center gap-3 text-[10px]">
            <a
              href={CHROME_WEB_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-gray-500 hover:text-chase-blue transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Chrome Web Store
            </a>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-gray-500 hover:text-chase-blue transition-colors"
            >
              <Github className="h-3 w-3" />
              GitHub
            </a>
          </div>
          <p className="text-center text-[9px] text-gray-400 leading-tight">
            Unofficial tool. Runs locally. <br/>
            Chrome Web Store installs update automatically.
          </p>
        </div>
      </footer>
    </div>
    </ErrorBoundary>
  );
};

export default App;
