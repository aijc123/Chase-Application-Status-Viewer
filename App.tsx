import React, { useState } from 'react';
import { ChaseApplicationData } from './types';
import { InputForm } from './components/InputForm';
import { Dashboard } from './components/Dashboard';
import { FileText, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<ChaseApplicationData | null>(null);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-chase-navy text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-chase-blue bg-white rounded-full p-1" />
            <h1 className="text-xl font-bold tracking-tight">Chase Application Status Viewer</h1>
          </div>
          <div className="text-sm text-gray-300 hidden sm:block">
            Unofficial Tool for Recon
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {!data ? (
            <InputForm onDataParsed={setData} />
          ) : (
            <Dashboard data={data} onReset={() => setData(null)} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            This tool parses JSON locally in your browser. No data is sent to any server.
            <br />
            Not affiliated with JPMorgan Chase & Co.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;