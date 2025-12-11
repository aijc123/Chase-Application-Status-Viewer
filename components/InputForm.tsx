import React, { useState, useEffect } from 'react';
import { ChaseApplicationData } from '../types';
import { AlertCircle, Code, Search, Loader2, RefreshCw, HelpCircle, ChevronDown, ChevronUp, Zap } from 'lucide-react';

// Declare chrome global
declare var chrome: any;

interface InputFormProps {
  onDataParsed: (data: ChaseApplicationData[]) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ onDataParsed }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isExtension, setIsExtension] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

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
      let dataToProcess: ChaseApplicationData[] = [];

      // Handle Array (Multiple Apps) or Single Object
      if (Array.isArray(parsed)) {
        dataToProcess = parsed;
      } else {
        dataToProcess = [parsed];
      }

      // Validation
      const isValid = dataToProcess.some(item => 
        item.productApplicationIdentifier && (
            item.cardAccountStatus || 
            item.enrollmentProductStatus || 
            item.depositAccountStatus ||
            item.lendingAccountStatus ||
            item.investmentAccountStatus
        )
      );

      if (!isValid) {
        throw new Error("Parsed valid JSON, but found no Chase application data. Ensure you copied the response from a 'status' or 'applications' endpoint containing fields like 'productApplicationIdentifier' or 'cardAccountStatus'.");
      }

      onDataParsed(dataToProcess);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleScanTab = async () => {
    setScanning(true);
    setError(null);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error("No active tab.");
      
      if (!tab.url?.includes("chase.com")) {
        throw new Error("Wrong Site. Go to Chase.com Application Status page.");
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async () => {
          try {
             // --- Strategy 1: Smart Log Scan (Most Accurate) ---
             // We first look for the EXACT URL the page used.
            const entries = performance.getEntriesByType("resource");
            const statusEntry = entries.reverse().find(e => {
              // Typical Chase Status APIs: 
              // .../v1/applications/status
              // .../v2/applications/status
              // .../applications/{UUID}/status
              const isStatusApi = (e.name.includes("/applications/") && e.name.includes("/status")) ||
                                  e.name.includes("app-status-api") ||
                                  e.name.includes("application/status");
              
              // Exclude the HTML page itself
              const isPageRoute = e.name.includes("originations/myApplications") || e.name.includes("cfgCode=AOSTATUS");

              return isStatusApi && !isPageRoute;
            });

            // Common headers needed for Chase APIs
            const headers = {
                'x-jpmc-csrf-token': 'NONE',
                'x-jpmc-channel': 'id=ci',
                'Accept': 'application/json'
            };

            // If we found a specific URL in logs, try that first
            if (statusEntry) {
                try {
                    const response = await fetch(statusEntry.name, { method: 'GET', headers: headers });
                    if (response.ok) {
                        const json = await response.json();
                        return { result: json, method: 'Log Scan' };
                    }
                } catch(e) {
                    console.log("Log scan fetch failed, trying fallback...");
                }
            }

            // --- Strategy 2: Blind Fetch (Fallback) ---
            // If log is empty (user didn't refresh), try common known endpoints directly.
            // This enables "One-Step" scanning without refresh in many cases.
            const commonEndpoints = [
                '/origination-api/v3/applications/status',
                '/origination-api/v2/applications/status',
                '/origination-api/v1/applications/status',
                '/origination-api/v4/applications/status' // Future proofing
            ];

            for (const endpoint of commonEndpoints) {
                try {
                    // We use relative paths, so it fetches against the current domain (e.g. creditcards.chase.com)
                    const response = await fetch(endpoint, { method: 'GET', headers: headers });
                    if (response.ok) {
                        const text = await response.text();
                        try {
                             const json = JSON.parse(text);
                             // Basic validation to ensure it's not an HTML error page
                             if (Array.isArray(json) || (json && json.productApplicationIdentifier)) {
                                 return { result: json, method: 'Direct Fetch' };
                             }
                        } catch(e) {}
                    }
                } catch (e) {
                    // Continue to next endpoint
                }
            }

            // If both strategies fail
            return { error: "NOT_FOUND" };

          } catch (e: any) {
            return { error: e.message || "Script Error" };
          }
        }
      });

      const scriptResult = results?.[0]?.result;

      if (scriptResult && scriptResult.result) {
        // Handle the result whether it's an array or object
        let resData = scriptResult.result;
        if (!Array.isArray(resData)) resData = [resData];
        onDataParsed(resData);
      } else if (scriptResult && scriptResult.error) {
         if (scriptResult.error === "NOT_FOUND") {
             throw new Error("NOT_FOUND");
         } else {
             throw new Error(scriptResult.error);
         }
      } else {
        throw new Error("Failed to retrieve data.");
      }

    } catch (err: any) {
      const msg = err.message || "Unknown error";
      if (msg.includes("NOT_FOUND")) {
          setError("Could not find status data automatically. Please Refresh page (F5) and try again.");
          setShowGuide(true); 
      } else {
          setError(`Scan failed: ${msg.replace('Error: ', '')}. Please Refresh & Try again.`);
          setShowGuide(true);
      }
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
        <p className="opacity-90 mt-1 text-[10px] leading-tight">
            {isExtension 
              ? "Use on 'Application Status' page." 
              : "Paste JSON from network logs."}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {isExtension && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center space-y-2">
                <button
                    onClick={handleScanTab}
                    disabled={scanning}
                    className="w-full py-2.5 bg-chase-blue text-white rounded-md font-semibold text-sm shadow hover:bg-blue-700 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
                >
                    {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                    {scanning ? "Scanning..." : "One-Click Scan"}
                </button>
                <div className="flex gap-2 justify-center text-[10px] text-blue-700">
                   <span className="flex items-center gap-1 opacity-80">Auto-detects API endpoints</span>
                </div>
            </div>
        )}

        {error && (
          <div className="p-2.5 bg-red-50 border-l-2 border-red-500 text-red-700 text-xs flex gap-2 rounded-r items-start">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="leading-tight">{error}</div>
          </div>
        )}

        <div className="border border-blue-100 bg-blue-50 rounded-lg overflow-hidden transition-all">
          <button 
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between p-3 text-left text-xs font-semibold text-blue-800 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>How to get JSON manually?</span>
            </div>
            {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {showGuide && (
            <div className="p-3 bg-white border-t border-blue-100 text-[10px] text-gray-600 space-y-2 animate-in slide-in-from-top-1">
                <p>If scanning fails, follow these steps:</p>
                <ol className="list-decimal pl-4 space-y-1.5 marker:text-blue-500">
                    <li>Press <kbd className="font-mono bg-gray-100 px-1 rounded border border-gray-300">F12</kbd> to open Developer Tools.</li>
                    <li>Go to the <b>Network</b> tab.</li>
                    <li><b className="text-red-600">Refresh the page</b> (F5) to load data.</li>
                    <li>In the Filter box, type: <code className="bg-blue-50 text-blue-700 px-1 rounded">status</code></li>
                    <li>Click the row named <code className="text-blue-700">status</code> (or ending in .../status).</li>
                    <li>Click the <b>Response</b> tab on the right.</li>
                    <li>Copy all the JSON text and paste it below.</li>
                </ol>
            </div>
          )}
       </div>

        <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="h-px bg-gray-200 flex-grow"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Or Paste Manual JSON</span>
                <div className="h-px bg-gray-200 flex-grow"></div>
            </div>

            <textarea
                className="w-full h-20 p-2 font-mono text-[10px] bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-chase-blue outline-none placeholder:text-gray-400"
                placeholder='Paste raw JSON here (Starts with [ or { )'
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
        </div>

        <div className="flex gap-2 justify-end pt-1">
            <button
                onClick={handleParse}
                className="px-4 py-2 bg-gray-800 text-white rounded-md text-xs font-semibold hover:bg-gray-700"
            >
                Parse JSON
            </button>
        </div>
      </div>
    </div>
  );
};