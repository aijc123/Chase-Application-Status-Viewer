import React from 'react';
import { ChaseApplicationData } from '../types';
import { ArrowLeft } from 'lucide-react';
import { InfoCard } from './InfoCard';
import { DocumentStatus } from './DocumentStatus';
import { RawViewer } from './RawViewer';

interface DashboardProps {
  data: ChaseApplicationData;
  onReset: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  // Usually the array has one active application status, we'll take the first one or map all if multiple.
  // For this specific use case, we usually see one card status object.
  const mainStatus = data.cardAccountStatus?.[0];

  if (!mainStatus) {
    return (
      <div className="text-center p-12">
        <h2 className="text-xl text-gray-600">No card account status found in data.</h2>
        <button onClick={onReset} className="mt-4 text-chase-blue underline">Try Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-gray-500 hover:text-chase-blue transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Input
        </button>
        <div className="text-xs text-gray-400">
            Last Parsed: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoCard
          label="Application Status"
          value={mainStatus.productApplicationStatusCode}
          highlight
          subValue={mainStatus.statusAdditionalInformation?.straightThroughEligibilityIndicator === false ? "Straight Through: False" : undefined}
          tooltip="This is the internal status code. 'PEND_CALL_SUPPORT' usually indicates a need for recon."
        />
        <InfoCard
          label="Reference Number"
          value={mainStatus.decisionEngineReferenceIdentifier || "N/A"}
          copyable
          tooltip="Use this number when calling the reconsideration line."
        />
        <InfoCard
          label="Last Status Change"
          value={formatDate(mainStatus.productApplicationStatusChangeTimestamp)}
          isTime
          subValue={getTimeAgo(mainStatus.productApplicationStatusChangeTimestamp)}
          tooltip="If this time updates while you are on the phone, the agent has likely touched your application."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
             {/* Required Actions / Errors */}
             {(mainStatus.statusAdditionalInformation?.errors?.length || 0) > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        Errors Detected
                    </h3>
                    <div className="space-y-2">
                        {mainStatus.statusAdditionalInformation?.errors?.map((err, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-md border border-red-100 text-red-700 font-mono text-sm">
                                Error Code: {err.errorCode}
                            </div>
                        ))}
                    </div>
                </div>
             )}

            <DocumentStatus
                pendInfo={mainStatus.pendRequiredInformation}
                actionList={mainStatus.statusAdditionalInformation?.requiredActionList}
            />

            <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Timeline</h3>
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-2">
                    <TimelineItem
                        date={data.applicationCreateTimestamp}
                        label="Application Created"
                    />
                    <TimelineItem
                        date={data.applicationSubmitTimestamp}
                        label="Application Submitted"
                    />
                    <TimelineItem
                        date={data.applicationLastUpdateTimestamp}
                        label="Last System Update"
                    />
                    <TimelineItem
                        date={mainStatus.productApplicationStatusChangeTimestamp}
                        label="Status Changed"
                        active
                    />
                </div>
            </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
             <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Meta Data</h3>
                <dl className="space-y-4 text-sm">
                    <MetaRow label="Product Code" value={mainStatus.productCode} />
                    <MetaRow label="Sub Product" value={mainStatus.subProductCode} />
                    <MetaRow label="Acquisition Source" value={mainStatus.acquisitionSourceName || 'N/A'} />
                    <MetaRow label="Market Cell ID" value={mainStatus.marketCellIdentifier || 'N/A'} />
                    <MetaRow label="Eligibility Indicator" value={String(mainStatus.statusAdditionalInformation?.straightThroughEligibilityIndicator ?? 'N/A')} />
                </dl>
             </div>

             <RawViewer data={data} />
        </div>
      </div>
    </div>
  );
};

const TimelineItem: React.FC<{ date?: string; label: string; active?: boolean }> = ({ date, label, active }) => {
    if (!date) return null;
    return (
        <div className="relative pl-8">
            <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${active ? 'bg-chase-blue border-chase-blue' : 'bg-white border-gray-300'}`}></span>
            <div className={`font-medium ${active ? 'text-chase-blue' : 'text-gray-900'}`}>{label}</div>
            <div className="text-sm text-gray-500 font-mono mt-1">{new Date(date).toLocaleString()}</div>
        </div>
    );
}

const MetaRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
        <dt className="text-gray-500">{label}</dt>
        <dd className="font-medium text-gray-900 font-mono">{value}</dd>
    </div>
);

function formatDate(isoString?: string) {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', second: '2-digit'
    });
}

function getTimeAgo(isoString?: string) {
    if (!isoString) return '';
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    if (minutes > 0) return `${minutes} minutes ago`;
    return 'Just now';
}