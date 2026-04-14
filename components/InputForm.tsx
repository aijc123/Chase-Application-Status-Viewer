import React, { useEffect, useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Code, HelpCircle, Loader2, Zap } from 'lucide-react';
import { ChaseApplicationData } from '../types';
import { isValidChaseData } from '../utils';
import {
  MANUAL_GUIDE_PREFERENCE_KEY,
  classifyScanError,
  getScanFeedback,
  type ScanFeedback,
} from '../scanFeedback';

interface InputFormProps {
  onDataParsed: (data: ChaseApplicationData[]) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ onDataParsed }) => {
  const [input, setInput] = useState('');
  const [scanFeedback, setScanFeedback] = useState<ScanFeedback | null>(null);
  const [isExtension, setIsExtension] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting) {
      setIsExtension(true);
    }

    const savedPreference = localStorage.getItem(MANUAL_GUIDE_PREFERENCE_KEY);
    setShowGuide(savedPreference === null ? true : savedPreference === 'true');
  }, []);

  const updateGuideVisibility = (nextValue: boolean) => {
    setShowGuide(nextValue);
    localStorage.setItem(MANUAL_GUIDE_PREFERENCE_KEY, String(nextValue));
  };

  const handleParse = () => {
    try {
      if (!input.trim()) {
        setScanFeedback({
          type: 'unknown',
          title: 'Paste JSON to continue',
          message: 'No JSON was provided yet.',
          nextSteps: ['Paste the full JSON response, then click Parse JSON.'],
          showGuide: false,
        });
        return;
      }

      const parsed = JSON.parse(input);
      const dataToProcess: ChaseApplicationData[] = Array.isArray(parsed) ? parsed : [parsed];

      if (!isValidChaseData(dataToProcess)) {
        throw new Error("Parsed valid JSON, but found no Chase application data. Ensure you copied the response from a 'status' or 'applications' endpoint containing fields like 'productApplicationIdentifier' or 'cardAccountStatus'.");
      }

      onDataParsed(dataToProcess);
      setScanFeedback(null);
    } catch (err) {
      setScanFeedback({
        type: 'unknown',
        title: 'JSON could not be parsed',
        message: (err as Error).message,
        nextSteps: ['Confirm you copied the full JSON response before parsing again.'],
        showGuide: true,
      });
      updateGuideVisibility(true);
    }
  };

  const handleScanTab = async () => {
    setScanning(true);
    setScanFeedback(null);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error('No active tab.');

      if (!tab.url?.includes('chase.com')) {
        throw new Error('Wrong Site. Go to Chase.com Application Status page.');
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async () => {
          try {
            const entries = performance.getEntriesByType('resource');
            let hadFetchFailure = false;
            const statusEntry = entries.reverse().find((entry) => {
              const isStatusApi = (entry.name.includes('/applications/') && entry.name.includes('/status'))
                || entry.name.includes('app-status-api')
                || entry.name.includes('application/status');
              const isPageRoute = entry.name.includes('originations/myApplications')
                || entry.name.includes('cfgCode=AOSTATUS');

              return isStatusApi && !isPageRoute;
            });

            const headers = {
              'x-jpmc-csrf-token': 'NONE',
              'x-jpmc-channel': 'id=ci',
              Accept: 'application/json',
            };

            const fetchWithTimeout = async (url: string, opts: RequestInit) => {
              const controller = new AbortController();
              const id = setTimeout(() => controller.abort(), 8000);
              try {
                return await fetch(url, { ...opts, signal: controller.signal });
              } finally {
                clearTimeout(id);
              }
            };

            if (statusEntry) {
              try {
                const response = await fetchWithTimeout(statusEntry.name, { method: 'GET', headers });
                if (response.ok) {
                  const json = await response.json();
                  return { result: json, method: 'Log Scan' };
                }
              } catch {
                hadFetchFailure = true;
              }
            }

            const commonEndpoints = [
              '/origination-api/v3/applications/status',
              '/origination-api/v2/applications/status',
              '/origination-api/v1/applications/status',
              '/origination-api/v4/applications/status',
            ];

            for (const endpoint of commonEndpoints) {
              try {
                const response = await fetchWithTimeout(endpoint, { method: 'GET', headers });
                if (response.ok) {
                  const text = await response.text();
                  try {
                    const json = JSON.parse(text);
                    if (Array.isArray(json) || (json && json.productApplicationIdentifier)) {
                      return { result: json, method: 'Direct Fetch' };
                    }
                  } catch {
                    // Continue trying other endpoints.
                  }
                }
              } catch {
                hadFetchFailure = true;
              }
            }

            if (hadFetchFailure) {
              return { error: 'FETCH_FAILED' };
            }

            return { error: 'NOT_FOUND' };
          } catch (e: any) {
            return { error: e.message || 'Script Error' };
          }
        },
      });

      const scriptResult = results?.[0]?.result;

      if (scriptResult && scriptResult.result) {
        let resData: ChaseApplicationData[] = scriptResult.result;
        if (!Array.isArray(resData)) resData = [resData];

        if (!isValidChaseData(resData)) {
          throw new Error('NOT_FOUND');
        }

        onDataParsed(resData);
      } else if (scriptResult && scriptResult.error) {
        if (scriptResult.error === 'NOT_FOUND') {
          throw new Error('NOT_FOUND');
        }

        throw new Error(scriptResult.error);
      } else {
        throw new Error('Failed to retrieve data.');
      }
    } catch (err: any) {
      const msg = err.message || 'Unknown error';
      const feedback = getScanFeedback(classifyScanError(msg));
      setScanFeedback(feedback);
      if (feedback.showGuide) {
        updateGuideVisibility(true);
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
        <p className="opacity-90 mt-1 text-xs leading-tight">
          {isExtension
            ? "Use on the Chase Application Status page after the page has refreshed at least once."
            : 'Paste JSON from network logs.'}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {isExtension && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center space-y-2">
            <button
              onClick={handleScanTab}
              disabled={scanning}
              aria-label="Scan the current Chase status page"
              className="w-full py-2.5 bg-chase-blue text-white rounded-md font-semibold text-sm shadow hover:bg-blue-700 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
            >
              {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
              {scanning ? 'Scanning...' : 'One-Click Scan'}
            </button>
            <div className="flex gap-2 justify-center text-xs text-blue-700">
              <span className="flex items-center gap-1 opacity-80">
                Works best when you are already on the Chase status page and have refreshed it once.
              </span>
            </div>
          </div>
        )}

        {scanFeedback && (
          <div className="p-3 bg-red-50 border-l-2 border-red-500 text-red-800 text-sm flex gap-2 rounded-r items-start">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="leading-tight space-y-2">
              <div>
                <p className="font-semibold">{scanFeedback.title}</p>
                <p className="text-red-700">{scanFeedback.message}</p>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-red-700">
                {scanFeedback.nextSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
              {scanFeedback.showGuide && !showGuide && (
                <button
                  onClick={() => updateGuideVisibility(true)}
                  className="text-xs font-semibold text-red-800 underline underline-offset-2"
                >
                  Show manual JSON steps
                </button>
              )}
            </div>
          </div>
        )}

        <div className="border border-blue-100 bg-blue-50 rounded-lg overflow-hidden transition-all">
          <button
            onClick={() => updateGuideVisibility(!showGuide)}
            className="w-full flex items-center justify-between p-3 text-left text-sm font-semibold text-blue-800 hover:bg-blue-100 transition-colors"
            aria-expanded={showGuide}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              <span>How to get JSON manually?</span>
            </div>
            {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showGuide && (
            <div className="p-3 bg-white border-t border-blue-100 text-xs text-gray-700 space-y-2 animate-in slide-in-from-top-1">
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
            <div className="h-px bg-gray-200 flex-grow" />
            <span className="text-[10px] font-bold text-gray-400 uppercase">Or Paste Manual JSON</span>
            <div className="h-px bg-gray-200 flex-grow" />
          </div>

          <textarea
            className="w-full h-20 p-2 font-mono text-xs bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-chase-blue outline-none placeholder:text-gray-400"
            placeholder="Paste raw JSON here (Starts with [ or { )"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={handleParse}
            aria-label="Parse pasted JSON"
            className="px-4 py-2 bg-gray-800 text-white rounded-md text-xs font-semibold hover:bg-gray-700"
          >
            Parse JSON
          </button>
        </div>
      </div>
    </div>
  );
};
