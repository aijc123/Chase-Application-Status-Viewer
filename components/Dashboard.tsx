import React from 'react';
import { ChaseApplicationData } from '../types';
import { ArrowLeft, Phone, ShieldAlert, CheckCircle2, HelpCircle } from 'lucide-react';
import { InfoCard } from './InfoCard';
import { DocumentStatus } from './DocumentStatus';
import { RawViewer } from './RawViewer';

interface DashboardProps {
  data: ChaseApplicationData;
  onReset: () => void;
}

// Knowledge base for Chase Status Codes
const STATUS_DEFINITIONS: Record<string, { title: string; description: string; sentiment: 'success' | 'warning' | 'error' | 'neutral' }> = {
  'APPROVED': { title: 'Approved', description: 'Congratulations! Your card account has been established.', sentiment: 'success' },
  'DECLINED': { title: 'Declined', description: 'The application was denied. Check the error codes and call reconsideration.', sentiment: 'error' },
  'PEND_CALL_SUPPORT': { title: 'Verification Required', description: 'This usually means they need to verify your identity or address. Highly recommended to call the Recon line immediately.', sentiment: 'warning' },
  'PEND_VOT_ENROLL': { title: 'Voice Verification', description: 'Fraud prevention check. They likely need to verify it is really you applying.', sentiment: 'warning' },
  'PEND_REVIEW': { title: 'Under Review', description: 'Application is being manually reviewed by an underwriter.', sentiment: 'neutral' },
  'CONCURRENCY_REVIEW': { title: 'Concurrency Review', description: 'System busy or multiple applications detected.', sentiment: 'neutral' },
  'COMPLETE': { title: 'Processing Complete', description: 'The system has finished processing.', sentiment: 'success' },
};

const RECON_NUMBERS = [
    { label: "Personal Credit Analyst (Recon)", number: "888-270-2127" },
    { label: "Business Credit Analyst (Recon)", number: "800-453-9719" },
    { label: "Application Status Line (Automated)", number: "800-432-3117" }
];

export const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const mainStatus = data.cardAccountStatus?.[0];

  if (!mainStatus) {
    return (
      <div className="text-center p-12">
        <h2 className="text-xl text-gray-600">No card account status found in data.</h2>
        <button onClick={onReset} className="mt-4 text-chase-blue underline">Try Again</button>
      </div>
    );
  }

  const statusCode = mainStatus.productApplicationStatusCode;
  const statusDef = STATUS_DEFINITIONS[statusCode] || { 
    title: statusCode, 
    description: "Unknown internal status code.", 
    sentiment: 'neutral' 
  };

  const isActionable = statusCode !== 'APPROVED' && statusCode !== 'COMPLETE';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
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

      {/* Hero Status Banner */}
      <div className={`rounded-xl p-6 border-l-8 shadow-sm ${
        statusDef.sentiment === 'success' ? 'bg-green-50 border-green-500' :
        statusDef.sentiment === 'error' ? 'bg-red-50 border-red-500' :
        statusDef.sentiment === 'warning' ? 'bg-amber-50 border-amber-500' :
        'bg-white border-gray-300'
      }`}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
                <h2 className={`text-3xl font-bold tracking-tight mb-2 ${
                    statusDef.sentiment === 'success' ? 'text-green-800' :
                    statusDef.sentiment === 'error' ? 'text-red-800' :
                    statusDef.sentiment === 'warning' ? 'text-amber-800' :
                    'text-gray-800'
                }`}>
                    {statusDef.title}
                </h2>
                <p className="text-gray-700 font-medium">{statusDef.description}</p>
                <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 bg-white/50 rounded text-xs font-mono text-gray-500 border border-black/5">
                    Code: {statusCode}
                </div>
            </div>
            
            {statusDef.sentiment === 'success' && (
                <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
            )}
            {(statusDef.sentiment === 'warning' || statusDef.sentiment === 'error') && (
                <div className={`${statusDef.sentiment === 'error' ? 'bg-red-100' : 'bg-amber-100'} p-3 rounded-full`}>
                    <ShieldAlert className={`w-8 h-8 ${statusDef.sentiment === 'error' ? 'text-red-600' : 'text-amber-600'}`} />
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoCard
          label="Reference Number"
          value={mainStatus.decisionEngineReferenceIdentifier || "N/A"}
          copyable
          tooltip="Essential for calling the reconsideration line. Quote this number to the agent."
        />
        <InfoCard
          label="Status Updated"
          value={formatDate(mainStatus.productApplicationStatusChangeTimestamp)}
          isTime
          subValue={getTimeAgo(mainStatus.productApplicationStatusChangeTimestamp)}
          tooltip="The exact time the system last touched your application."
        />
        <InfoCard
          label="Product Code"
          value={mainStatus.productCode}
          subValue={mainStatus.subProductCode ? `Sub: ${mainStatus.subProductCode}` : undefined}
          tooltip="Internal code identifying the specific card product."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
             {/* Recon Advice Section - Only show if actionable */}
             {isActionable && (
                <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-chase-navy px-6 py-4 flex items-center gap-3">
                        <Phone className="w-5 h-5 text-white" />
                        <h3 className="text-white font-semibold">Reconsideration Guide</h3>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-600 mb-6">
                            Since your application was not immediately approved, you may need to call Chase to verify information or request a reconsideration. Use the <strong>Reference Number</strong> above.
                        </p>
                        <div className="grid gap-4 md:grid-cols-2">
                            {RECON_NUMBERS.map((item, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-chase-blue transition-colors bg-gray-50 hover:bg-white group">
                                    <div className="text-xs text-gray-500 font-bold uppercase mb-1">{item.label}</div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-lg font-mono font-semibold text-gray-900 select-all">{item.number}</div>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(item.number)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-chase-blue text-xs underline"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
             )}

             {/* Required Actions / Errors */}
             {(mainStatus.statusAdditionalInformation?.errors?.length || 0) > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        Errors Detected
                    </h3>
                    <div className="space-y-2">
                        {mainStatus.statusAdditionalInformation?.errors?.map((err, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-md border border-red-100 text-red-700 font-mono text-sm flex justify-between items-center">
                                <span>Error Code: <strong>{err.errorCode}</strong></span>
                                <a 
                                    href={`https://www.google.com/search?q=Chase+credit+card+error+code+${err.errorCode}`} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-red-500 underline hover:text-red-700"
                                >
                                    Search Meaning
                                </a>
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
                        label={`Current Status: ${statusCode}`}
                        active
                    />
                </div>
            </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
             <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Meta Data</h3>
                <dl className="space-y-4 text-sm">
                    <MetaRow label="Acquisition Source" value={mainStatus.acquisitionSourceName || 'N/A'} />
                    <MetaRow label="Market Cell ID" value={mainStatus.marketCellIdentifier || 'N/A'} />
                    <MetaRow label="Eligibility Indicator" value={String(mainStatus.statusAdditionalInformation?.straightThroughEligibilityIndicator ?? 'N/A')} />
                    <MetaRow label="App ID" value={data.productApplicationIdentifier} truncate />
                    <MetaRow label="Cust. App ID" value={data.customerFacingApplicationIdentifier || 'N/A'} truncate />
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

const MetaRow: React.FC<{ label: string; value: string; truncate?: boolean }> = ({ label, value, truncate }) => (
    <div className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 last:pb-0">
        <dt className="text-gray-500">{label}</dt>
        <dd className={`font-medium text-gray-900 font-mono ${truncate ? 'max-w-[120px] truncate' : ''}`} title={value}>{value}</dd>
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