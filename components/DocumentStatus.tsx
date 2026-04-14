import React from 'react';
import { PendRequiredInformation } from '../types';
import { FileWarning, CheckCircle } from 'lucide-react';

interface DocumentStatusProps {
  pendInfo?: PendRequiredInformation;
  actionList?: string[];
}

export const DocumentStatus: React.FC<DocumentStatusProps> = ({ pendInfo, actionList }) => {
  const hasDocuments = (pendInfo?.requiredDocuments?.length || 0) > 0;
  const hasActions = (actionList?.length || 0) > 0;

  if (!hasDocuments && !hasActions) {
    return (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
                <h3 className="font-semibold text-green-900">No pending items detected</h3>
                <p className="text-green-800 text-sm">
                  We did not detect pending documents or immediate actions in this status response.
                </p>
                <p className="text-[11px] text-green-700 mt-1">
                  Please confirm with the official Chase status page, email, or text notifications before assuming no follow-up is needed.
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-amber-50 border-b border-amber-100 px-5 py-4">
        <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
          <FileWarning className="w-5 h-5" />
          What To Do Next
        </h3>
        <p className="text-xs text-amber-800 mt-1">
          Review any requested actions or documents before contacting support.
        </p>
      </div>
      
      <div className="p-5 space-y-6">
        {hasActions && (
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Action List</h4>
                <div className="flex flex-wrap gap-2">
                    {actionList?.map((action, i) => (
                        <span key={i} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium border border-amber-200">
                            {action}
                        </span>
                    ))}
                </div>
            </div>
        )}

        {hasDocuments && (
             <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Required Documents</h4>
                <div className="grid gap-3">
                    {pendInfo?.requiredDocuments?.map((doc, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="text-xs text-chase-blue font-bold mb-1">{doc.documentCategoryName}</div>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                {doc.documentTypeName.map((type, tIdx) => (
                                    <li key={tIdx}>{type}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
             </div>
        )}
      </div>
    </div>
  );
};
