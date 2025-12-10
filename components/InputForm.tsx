import React, { useState, useEffect } from 'react';
import { ChaseApplicationData } from '../types';
import { AlertCircle, Code, PlayCircle, Radio, Search, CheckCircle2, Loader2 } from 'lucide-react';

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
    // Check if running as a Chrome Extension
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting) {
      setIsExtension(true);
    }
  }, []);

  const handleParse = () => {
    try {
      if (!input.trim()) {
        setError('Please paste the JSON content first.');
        return;
      }
      const parsed = JSON.parse(input);
      if (!parsed.cardAccountStatus && !parsed.productApplicationIdentifier) {
        throw new Error("JSON does not look like a valid Chase application status response.");
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
      
      if (!tab.id) throw new Error("No active tab found");
      
      if (!tab.url?.includes("chase.com")) {
        throw new Error("Please navigate to the Chase Application Status page first.");
      }

      // Execute script in the active tab
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async () => {
          // Look for the specific API call in the performance logs
          const entries = performance.getEntries();
          // The API usually contains /originations/ or /applications/ and /status
          const statusEntry = entries.find(e => 
            e.name.includes("/applications/") && e.name.includes("/status")
          );

          if (!statusEntry) {
            throw new Error("Status API call not found in network logs. Please refresh the page and wait for the status to load.");
          }

          // Re-fetch the data using the current session
          const response = await fetch(statusEntry.name);
          if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
          return await response.json();
        }
      });

      // Handle the result from the injected script
      if (results && results[0] && results[0].result) {
        const data = results[0].result;
        // Verify structure
        if (!data.cardAccountStatus && !data.productApplicationIdentifier) {
           throw new Error("Retrieved data is not a valid Application Status object.");
        }
        onDataParsed(data);
      } else {
        // Checking if an error was thrown inside the script (results usually handle return values)
        // If the script threw an error, executeScript might not catch it cleanly in the result array depending on chrome version
        throw new Error("Failed to retrieve data. Ensure you are on the Application Status page.");
      }

    } catch (err: any) {
      // Clean up error message from chrome injection structure
      const msg = err.message || "Unknown error occurred";
      // Remove "Error: " prefix if present from the injected script error
      setError(msg.replace('Error: ', ''));
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-3xl mx-auto border border-gray-100">
      <div className="bg-gradient-to-r from-chase-navy to-chase-blue p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <Code className="w-6 h-6" />
            Chase Status Viewer
        </h2>
        <p className="opacity-90 mt-2 text-sm">
            {isExtension 
              ? "Scan your current tab or paste the JSON manually." 
              : "Paste the JSON response from the Chase network logs."}
        </p>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Chrome Extension Auto-Scan Button */}
        {isExtension && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center">
                <h3 className="text-blue-900 font-semibold mb-2">Automatic Detection</h3>
                <p className="text-sm text-blue-700 mb-4">
                    Navigate to the Chase Application Status page, wait for it to load, then click below.
                </p>
                <button
                    onClick={handleScanTab}
                    disabled={scanning}
                    className="w-full sm:w-auto px-6 py-3 bg-chase-blue text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mx-auto"
                >
                    {scanning ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Scanning Page...
                        </>
                    ) : (
                        <>
                            <Search className="w-5 h-5" />
                            Scan Current Tab
                        </>
                    )}
                </button>
            </div>
        )}

        {/* Manual Input */}
        <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="h-px bg-gray-200 flex-grow"></div>
                <span className="text-xs font-bold text-gray-400 uppercase">Or Paste JSON Manually</span>
                <div className="h-px bg-gray-200 flex-grow"></div>
            </div>

            <textarea
                className="w-full h-32 p-4 font-mono text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chase-blue focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                placeholder='Paste JSON here... {"productApplicationIdentifier": "..."}'
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3 rounded-r animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
                <p className="font-bold">Error</p>
                <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-2">
            <button
                onClick={loadDemo}
                className="text-gray-500 hover:text-chase-blue text-sm font-medium hover:underline transition-colors"
            >
                Load Demo Data
            </button>
            <button
                onClick={handleParse}
                className="w-full sm:w-auto px-8 py-3 bg-gray-800 text-white rounded-lg font-semibold shadow hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
            >
                <PlayCircle className="w-5 h-5" />
                Parse Text
            </button>
        </div>
      </div>
    </div>
  );
};