import React from 'react';
import { Copy, HelpCircle } from 'lucide-react';

interface InfoCardProps {
  label: string;
  value: string;
  subValue?: string;
  copyable?: boolean;
  tooltip?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  label,
  value,
  subValue,
  copyable,
  tooltip
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="relative overflow-hidden rounded-lg p-3 bg-white border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          {label}
        </h3>
        {tooltip && (
            <div className="group relative">
                <HelpCircle className="w-3 h-3 text-gray-300" />
                <div className="absolute right-0 w-32 p-1.5 mt-1 text-[10px] text-white bg-gray-800 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
                    {tooltip}
                </div>
            </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <p className="text-sm font-bold tracking-tight text-gray-900 truncate" title={value}>
          {value}
        </p>
        {copyable && (
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-chase-blue transition-colors"
            title="Copy"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
      </div>

      {subValue && (
        <p className="text-[10px] text-gray-400 mt-0.5 truncate">
          {subValue}
        </p>
      )}
    </div>
  );
};