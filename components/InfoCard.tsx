import React, { useState } from 'react';
import { Copy, Check, HelpCircle } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  const tooltipId = tooltip ? `info-tooltip-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Ignore clipboard errors so the card stays usable.
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg p-3 bg-white border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          {label}
        </h3>
        {tooltip && (
          <div className="group relative">
            <button
              type="button"
              aria-label={`${label} help`}
              aria-describedby={tooltipId}
              className="rounded text-gray-300 hover:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chase-blue"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            <div
              id={tooltipId}
              role="tooltip"
              className="absolute right-0 w-36 p-1.5 mt-1 text-[11px] text-white bg-gray-800 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-10 pointer-events-none"
            >
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
            className={`transition-colors ${copied ? 'text-green-500' : 'text-gray-400 hover:text-chase-blue'}`}
            title={copied ? 'Copied!' : 'Copy'}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
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
