import React, { useState, useEffect } from 'react';
import { ChaseApplicationData } from '../types';
import { AlertCircle, Code, Search, Loader2 } from 'lucide-react';

// Declare chrome global to fix TypeScript errors if @types/chrome is missing
declare var chrome: any;

interface InputFormProps {
  onDataParsed: (data: ChaseApplicationData) => void;
}

// Demo data for testing
const DEMO_DATA: ChaseApplicationData = {
  "productApplicationIdentifier": "12345678-DEMO-UUID",
  "customerFacingApplicationIdentifier": "REF-DEMO-999",
  "cardAccountStatus": [
    {
      "capturedApplicationIdentifier": "88887777",
      "productCode": "080",
      "subProductCode": "001",
      "acquisitionSourceName": "HPKD",
      "marketCellIdentifier": "NA",
      "productApplicationStatusCode": "PEND_CALL_SUPPORT",
      "statusAdditionalInformation": {
        "errors": [{ "errorCode": "C01" }],
        "straightThroughEligibilityIndicator": false,
        "requiredActionList": ["DOCUMENT_UPLOAD"]
      },
      "pendRequiredInformation": {
        "requiredDocuments": [
          { "documentCategoryName": "APPLICANT_VERIFICATION", "documentTypeName": ["Unverified or missing date of birth."] }
        ]
      },
      "productApplicationStatusChangeTimestamp": new Date().toISOString(),
      "decisionEngineReferenceIdentifier": "REF-1234-5678"
    }
  ],
  "applicationSubmitTimestamp": new Date().toISOString(),
  "applicationCreateTimestamp": new Date().toISOString(),
  "applicationLastUpdateTimestamp": new Date().toISOString()
};

export const InputForm: React.FC<InputFormProps> = ({ onDataParsed }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isExtension, setIsExtension] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting) {
      setIsExtension(true);
    }
  }, []);

  const handleParse = () => {
    try {
      if (!input.trim()) {
        setError('Please paste JSON first.');
        return;
      }
      const parsed = JSON.parse(input);
      if (!parsed.cardAccountStatus && !parsed.productApplicationIdentifier) {
        throw new Error("Invalid JSON data.");
      }
      onDataParsed(parsed as ChaseApplicationData);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const loadDemo = () => {
    onDataParsed(DEMO_DATA);
  };

  const handleScanTab = async () => {
    setScanning(true);
    setError(null);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error("No active tab.");
      if (!tab.url?.includes("chase.com")) {
        throw new Error("Go to Chase Application Status page first.");
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async () => {
          const entries = performance.getEntries();
          const statusEntry = entries.find(e => 
            e.name.includes("/applications/") && e.name.includes("/status")
          );

          if (!statusEntry) throw new Error("Status API not found. Refresh page.");

          const response = await fetch(statusEntry.name);
          if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
          return await response.json();
        }
      });

      if (results && results[0] && results[0].result) {
        onDataParsed(results[0].result);
      } else {
        throw new Error("Failed to retrieve data.");
      }

    } catch (err: any) {
      const msg = err.message || "Unknown error";
      setError(msg.replace('Error: ', ''));
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-chase-navy to-chase-blue p-4 text-white">
        <h2 className="text-lg font-bold flex items-center gap-2">
            <Code className="w-5 h-5" />
            Check Status
        </h2>
        <p className="opacity-90 mt-1 text-xs">
            {isExtension 
              ? "Scan current tab or paste JSON." 
              : "Paste JSON from network logs."}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {isExtension && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                <button
                    onClick={handleScanTab}
                    disabled={scanning}
                    className="w-full py-2 bg-chase-blue text-white rounded-md font-semibold text-sm shadow hover:bg-blue-700 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
                >
                    {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {scanning ? "Scanning..." : "Scan Current Tab"}
                </button>
                <p className="text-[10px] text-blue-600 mt-2">
                    Open Chase App Status page first.
                </p>
            </div>
        )}

        <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="h-px bg-gray-200 flex-grow"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Or Manual Input</span>
                <div className="h-px bg-gray-200 flex-grow"></div>
            </div>

            <textarea
                className="w-full h-20 p-2 font-mono text-xs bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-chase-blue outline-none placeholder:text-gray-400"
                placeholder='Paste JSON here...'
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
        </div>

        {error && (
          <div className="p-2 bg-red-50 border-l-2 border-red-500 text-red-700 text-xs flex gap-2 rounded-r">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-1">
            <button
                onClick={loadDemo}
                className="text-gray-400 hover:text-chase-blue text-xs font-medium hover:underline px-2"
            >
                Demo
            </button>
            <button
                onClick={handleParse}
                className="px-4 py-2 bg-gray-800 text-white rounded-md text-xs font-semibold hover:bg-gray-700"
            >
                Parse Data
            </button>
        </div>
      </div>
    </div>
  );
};