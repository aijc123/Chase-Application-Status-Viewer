import React, { useState } from 'react';
import { ChaseApplicationData } from '../types';
import { AlertCircle, Code, PlayCircle, Zap, HelpCircle, Copy, Book } from 'lucide-react';

interface InputFormProps {
  onDataParsed: (data: ChaseApplicationData) => void;
}

// Sample data based on the user's screenshots/request for demo purposes
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
        "errors": [
          {
            "errorCode": "C01"
          }
        ],
        "straightThroughEligibilityIndicator": false,
        "requiredActionList": ["DOCUMENT_UPLOAD"]
      },
      "pendRequiredInformation": {
        "requiredDocuments": [
          {
            "documentCategoryName": "APPLICANT_VERIFICATION",
            "documentTypeName": [
              "Unverified or missing date of birth. please provide proof of date of birth"
            ]
          },
          {
            "documentCategoryName": "APPLICANT_VERIFICATION",
            "documentTypeName": [
              "Proof of current physical address (e.g. utility bill, government issued id)"
            ]
          }
        ]
      },
      "productApplicationStatusChangeTimestamp": new Date().toISOString(),
      "decisionEngineReferenceIdentifier": "REF-1234-5678"
    }
  ],
  "applicationSubmitTimestamp": "2024-05-20T10:20:20.452-05:00",
  "applicationCreateTimestamp": "2024-05-20T10:03:07.831-05:00",
  "applicationLastUpdateTimestamp": "2024-05-20T10:20:20.452-05:00"
};

const BOOKMARKLET_CODE = `javascript:(async()=>{const t=performance.getEntries().find(e=>e.name.includes("/applications/")&&e.name.includes("/status"));if(!t)return alert("Status URL not found in network logs. Please refresh the page and wait for the status to load, then click this again.");try{const e=await fetch(t.name),n=await e.json(),o=JSON.stringify(n);const a=document.createElement("textarea");a.value=o,document.body.appendChild(a),a.select(),document.execCommand("copy"),document.body.removeChild(a),alert("Success! JSON copied to clipboard. Return to the viewer to paste.")}catch(e){alert("Error fetching data: "+e.message)}})();`;

export const InputForm: React.FC<InputFormProps> = ({ onDataParsed }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showHelper, setShowHelper] = useState(false);

  const handleParse = () => {
    try {
      if (!input.trim()) {
        setError('Please paste the JSON content first.');
        return;
      }
      const parsed = JSON.parse(input);
      // Basic validation to check if it looks like the right shape
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

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-3xl mx-auto border border-gray-100">
      <div className="bg-gradient-to-r from-chase-navy to-chase-blue p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <Code className="w-6 h-6" />
            Paste Application JSON
        </h2>
        <p className="opacity-90 mt-2 text-sm">
            Retrieve the JSON response from the network tab (look for <code>/applications/&#123;UUID&#125;/status</code>) and paste it below.
        </p>
      </div>

      <div className="p-6">
        
        {/* Helper Toggle */}
        <div className="mb-6">
            <button 
                onClick={() => setShowHelper(!showHelper)}
                className="flex items-center gap-2 text-sm font-medium text-chase-blue hover:text-blue-700 transition-colors"
            >
                <Zap className="w-4 h-4" />
                {showHelper ? "Hide Auto-Extraction Helper" : "How to get this automatically?"}
            </button>
            
            {showHelper && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <Book className="w-4 h-4" />
                        Method 1: The Magic Bookmarklet (Recommended)
                    </h3>
                    <p className="text-sm text-blue-800 mb-3">
                        Drag the button below to your browser's bookmarks bar. When you are on the Chase Application Status page, simply click the bookmark to copy the JSON automatically.
                    </p>
                    <div className="flex justify-center mb-6">
                        <a 
                            href={BOOKMARKLET_CODE}
                            onClick={(e) => e.preventDefault()}
                            className="bg-chase-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-md cursor-grab active:cursor-grabbing transition-all hover:scale-105 flex items-center gap-2"
                            title="Drag me to your bookmarks bar!"
                        >
                            <span className="text-xs">📑</span> Chase Status Grabber
                        </a>
                    </div>
                    
                    <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Method 2: Console Script
                    </h3>
                    <p className="text-sm text-blue-800 mb-2">
                        If you prefer, open the Developer Console (F12) on the Chase page and paste this script:
                    </p>
                    <div className="bg-slate-800 rounded-md p-3 relative group">
                        <code className="text-xs text-green-400 font-mono break-all block pr-8">
                            {BOOKMARKLET_CODE.replace('javascript:', '')}
                        </code>
                        <button 
                            onClick={() => navigator.clipboard.writeText(BOOKMARKLET_CODE.replace('javascript:', ''))}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white rounded hover:bg-white/10"
                            title="Copy Code"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>

        <div className="mb-4">
          <textarea
            className="w-full h-64 p-4 font-mono text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chase-blue focus:border-transparent outline-none transition-all placeholder:text-gray-400"
            placeholder='Paste JSON here... {"productApplicationIdentifier": "..."}'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3 rounded-r">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
                <p className="font-bold">Invalid JSON</p>
                <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <button
                onClick={loadDemo}
                className="text-gray-500 hover:text-chase-blue text-sm font-medium hover:underline transition-colors"
            >
                Load Demo Data
            </button>
            <button
                onClick={handleParse}
                className="w-full sm:w-auto px-8 py-3 bg-chase-blue text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 transform active:scale-95"
            >
                <PlayCircle className="w-5 h-5" />
                Analyze Status
            </button>
        </div>
      </div>
    </div>
  );
};