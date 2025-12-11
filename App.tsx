import React, { useState, useEffect } from 'react';
import { ChaseApplicationData } from './types';
import { InputForm } from './components/InputForm';
import { Dashboard } from './components/Dashboard';
import { UpdateBanner } from './components/UpdateBanner';
import { ShieldCheck } from 'lucide-react';

// Declare chrome API
declare var chrome: any;

const App: React.FC = () => {
  // Now storing an Array of applications
  const [data, setData] = useState<ChaseApplicationData[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data from Chrome storage on startup
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['chaseStatusDataArray'], (result: any) => {
        if (result.chaseStatusDataArray) {
          setData(result.chaseStatusDataArray);
        }
        setLoading(false);
      });
    } else {
      // Web mode
      const localData = localStorage.getItem('chaseStatusDataArray');
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

  const handleSetData = (newData: ChaseApplicationData[]) => {
    setData(newData);
    // Persist data
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ chaseStatusDataArray: newData });
    } else {
      localStorage.setItem('chaseStatusDataArray', JSON.stringify(newData));
    }
  };

  const handleReset = () => {
    setData(null);
    // Clear persistence
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove(['chaseStatusDataArray']);
    } else {
      localStorage.removeItem('chaseStatusDataArray');
    }
  };

  if (loading) {
      return <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">Loading...</div>;
  }

  return (
    <div className="min-h-full flex flex-col font-sans text-sm">
      {/* Header - Compact */}
      <header className="bg-chase-navy text-white shadow-md sticky top-0 z-50">
        <div className="px-3 h-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-chase-blue bg-white rounded-full p-0.5" />
            <h1 className="text-sm font-bold tracking-tight">Chase Status</h1>
          </div>
          <div className="text-[10px] text-gray-300">
            v1.0.4
          </div>
        </div>
      </header>
      
      {/* Update Notification */}
      <UpdateBanner />

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
        <div className="px-3 py-1.5">
          <p className="text-center text-[9px] text-gray-400 leading-tight">
            Unofficial tool. Runs locally. <br/>
            Not affiliated with JPMorgan Chase & Co.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;