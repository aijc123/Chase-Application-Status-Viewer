import React, { useState, useEffect } from 'react';
import { ChaseApplicationData } from './types';
import { InputForm } from './components/InputForm';
import { Dashboard } from './components/Dashboard';
import { ShieldCheck } from 'lucide-react';

// Declare chrome API
declare var chrome: any;

const App: React.FC = () => {
  const [data, setData] = useState<ChaseApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data from Chrome storage on startup
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['chaseStatusData'], (result: any) => {
        if (result.chaseStatusData) {
          setData(result.chaseStatusData);
        }
        setLoading(false);
      });
    } else {
      // Web mode
      const localData = localStorage.getItem('chaseStatusData');
      if (localData) {
        try {
          setData(JSON.parse(localData));
        } catch (e) {
          console.error("Failed to parse local data");
        }
      }
      setLoading(false);
    }
  }, []);

  const handleSetData = (newData: ChaseApplicationData) => {
    setData(newData);
    // Persist data
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ chaseStatusData: newData });
    } else {
      localStorage.setItem('chaseStatusData', JSON.stringify(newData));
    }
  };

  const handleReset = () => {
    setData(null);
    // Clear persistence
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove(['chaseStatusData']);
    } else {
      localStorage.removeItem('chaseStatusData');
    }
  };

  if (loading) {
      return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-400 text-sm">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header - Made Compact (h-12 instead of h-16) */}
      <header className="bg-chase-navy text-white shadow-md sticky top-0 z-50">
        <div className="px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-chase-blue bg-white rounded-full p-0.5" />
            <h1 className="text-base font-bold tracking-tight">Chase Status</h1>
          </div>
          <div className="text-[10px] text-gray-300">
            v1.0.1
          </div>
        </div>
      </header>

      {/* Main Content - Reduced Padding */}
      <main className="flex-grow bg-gray-50 p-3">
        <div className="mx-auto">
          {!data ? (
            <InputForm onDataParsed={handleSetData} />
          ) : (
            <Dashboard data={data} onReset={handleReset} />
          )}
        </div>
      </main>

      {/* Footer - Made Compact */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="px-4 py-2">
          <p className="text-center text-[10px] text-gray-400 leading-tight">
            Unofficial tool. Runs locally. <br/>
            Not affiliated with JPMorgan Chase & Co.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;