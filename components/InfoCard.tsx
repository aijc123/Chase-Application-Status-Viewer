import React from 'react';
import { Copy, HelpCircle } from 'lucide-react';

interface InfoCardProps {
  label: string;
  value: string;
  subValue?: string;
  highlight?: boolean;
  copyable?: boolean;
  isTime?: boolean;
  tooltip?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  label,
  value,
  subValue,
  highlight,
  copyable,
  isTime,
  tooltip
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className={`
      relative overflow-hidden rounded-xl p-6 border shadow-sm transition-all
      ${highlight ? 'bg-gradient-to-br from-chase-blue to-blue-600 text-white border-transparent' : 'bg-white border-gray-200 text-gray-900'}
    `}>
      <div className="flex justify-between items-start mb-2">
        <h3 className={`text-sm font-medium ${highlight ? 'text-blue-100' : 'text-gray-500'}`}>
          {label}
        </h3>
        {tooltip && (
            <div className="group relative">
                <HelpCircle className={`w-4 h-4 ${highlight ? 'text-blue-200' : 'text-gray-400'}`} />
                <div className="absolute right-0 w-48 p-2 mt-2 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    {tooltip}
                </div>
            </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <p className={`text-2xl font-bold tracking-tight ${isTime ? 'text-xl' : 'text-2xl'}`}>
          {value}
        </p>
        {copyable && (
          <button
            onClick={handleCopy}
            className={`p-1 rounded-md transition-colors ${highlight ? 'hover:bg-white/20' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
            title="Copy"
          >
            <Copy className="w-4 h-4" />
          </button>
        )}
      </div>

      {subValue && (
        <p className={`mt-2 text-sm ${highlight ? 'text-blue-100' : 'text-gray-500'}`}>
          {subValue}
        </p>
      )}
    </div>
  );
};