import React, { useState } from 'react';
import { ChaseApplicationData } from '../types';
import { ChevronDown, ChevronRight, FileJson } from 'lucide-react';

// Can accept a single app object or the whole array, typing as any for flexibility in debug
export const RawViewer: React.FC<{ data: any }> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="flex items-center gap-2 font-medium text-gray-700">
            <FileJson className="w-4 h-4" />
            Raw JSON Data
        </span>
        {isOpen ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
      </button>
      
      {isOpen && (
        <div className="p-0 border-t border-gray-200">
          <pre className="p-4 text-xs font-mono overflow-x-auto bg-[#1e1e1e] text-[#d4d4d4] max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};