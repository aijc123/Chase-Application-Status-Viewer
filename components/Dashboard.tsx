import React, { useState, useMemo } from 'react';
import { ChaseApplicationData, GenericAccountStatus } from '../types';
import { ArrowLeft, Phone, ShieldAlert, CheckCircle2, ChevronRight, CreditCard, Banknote, Filter } from 'lucide-react';
import { InfoCard } from './InfoCard';
import { DocumentStatus } from './DocumentStatus';
import { RawViewer } from './RawViewer';

interface DashboardProps {
  data: ChaseApplicationData[];
  onReset: () => void;
}

const STATUS_DEFINITIONS: Record<string, { title: string; description: string; sentiment: 'success' | 'warning' | 'error' | 'neutral' }> = {
  'APPROVED': { title: 'Approved', description: 'Account established.', sentiment: 'success' },
  'DECLINED': { title: 'Declined', description: 'Application denied.', sentiment: 'error' },
  'PEND_CALL_SUPPORT': { title: 'Verification Req.', description: 'Call Recon immediately.', sentiment: 'warning' },
  'PEND_VOT_ENROLL': { title: 'Voice Check', description: 'Fraud check required.', sentiment: 'warning' },
  'PEND_REVIEW': { title: 'Under Review', description: 'Manual review in progress.', sentiment: 'neutral' },
  'CONCURRENCY_REVIEW': { title: 'Reviewing', description: 'System busy/Multiple apps.', sentiment: 'neutral' },
  'COMPLETE': { title: 'Complete', description: 'Processing finished.', sentiment: 'success' },
};

const RECON_NUMBERS = [
    { label: "Personal Recon", number: "888-270-2127" },
    { label: "Business Recon", number: "800-453-9719" },
    { label: "Automated Status", number: "800-432-3117" }
];

export const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(data.length === 1 ? 0 : null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Extract unique statuses for the filter dropdown
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    data.forEach(app => {
      const statusObj = getPrimaryStatus(app);
      if (statusObj?.productApplicationStatusCode) {
        statuses.add(statusObj.productApplicationStatusCode);
      }
    });
    return Array.from(statuses).sort();
  }, [data]);

  // Filter the data based on selection
  const filteredData = useMemo(() => {
    if (filterStatus === 'ALL') return data;
    return data.filter(app => {
      const statusObj = getPrimaryStatus(app);
      return statusObj?.productApplicationStatusCode === filterStatus;
    });
  }, [data, filterStatus]);

  if (selectedIndex === null) {
      return (
          <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <button onClick={onReset} className="flex items-center gap-1 text-gray-500 hover:text-chase-blue text-xs font-medium">
                        <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                    <span className="text-xs font-bold text-gray-500">
                        {filteredData.length} of {data.length} Apps
                    </span>
                </div>

                {uniqueStatuses.length > 0 && (
                    <div className="flex items-center gap-1">
                        <Filter className="w-3 h-3 text-gray-400" />
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="text-[10px] bg-white border border-gray-300 rounded px-1.5 py-1 outline-none focus:border-chase-blue focus:ring-1 focus:ring-chase-blue"
                        >
                            <option value="ALL">All Statuses</option>
                            {uniqueStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                )}
              </div>
              
              {filteredData.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
                      <p className="text-xs text-gray-400">No applications match the selected filter.</p>
                  </div>
              ) : (
                  filteredData.map((app) => {
                      // Find the index in the original data array to ensure correct selection
                      const originalIndex = data.indexOf(app);
                      const statusObj = getPrimaryStatus(app);
                      const statusInfo = getStatusInfo(statusObj?.productApplicationStatusCode);
                      
                      return (
                        <div 
                            key={originalIndex} 
                            onClick={() => setSelectedIndex(originalIndex)}
                            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:border-chase-blue transition-colors flex items-center justify-between"
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${statusInfo.sentiment === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-chase-blue'}`}>
                                    {app.cardAccountStatus ? <CreditCard className="w-5 h-5"/> : <Banknote className="w-5 h-5"/>}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">
                                        {app.cardAccountStatus ? 'Credit Card' : 'Bank Account'}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                                        Code: {statusObj?.productCode}-{statusObj?.subProductCode}
                                    </p>
                                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold mt-2 ${
                                        statusInfo.sentiment === 'success' ? 'bg-green-100 text-green-700' :
                                        statusInfo.sentiment === 'error' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {statusInfo.title}
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      );
                  })
              )}
          </div>
      );
  }

  const appData = data[selectedIndex];
  const mainStatus = getPrimaryStatus(appData);

  if (!mainStatus) return <div>No status details available.</div>;

  const statusDef = getStatusInfo(mainStatus.productApplicationStatusCode);
  const isActionable = statusDef.sentiment === 'warning' || statusDef.sentiment === 'error';

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 pb-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => data.length > 1 ? setSelectedIndex(null) : onReset()}
          className="flex items-center gap-1 text-gray-500 hover:text-chase-blue text-xs font-medium"
        >
          <ArrowLeft className="w-3 h-3" />
          {data.length > 1 ? 'All Apps' : 'Back'}
        </button>
        <div className="text-[10px] text-gray-400">
           ID: {appData.productApplicationIdentifier.slice(0, 8)}...
        </div>
      </div>

      {/* Hero Status Banner */}
      <div className={`rounded-lg p-4 border-l-4 shadow-sm ${
        statusDef.sentiment === 'success' ? 'bg-green-50 border-green-500' :
        statusDef.sentiment === 'error' ? 'bg-red-50 border-red-500' :
        statusDef.sentiment === 'warning' ? 'bg-amber-50 border-amber-500' :
        'bg-white border-gray-300'
      }`}>
        <div className="flex items-start justify-between gap-2">
            <div>
                <h2 className={`text-xl font-bold tracking-tight ${
                    statusDef.sentiment === 'success' ? 'text-green-800' :
                    statusDef.sentiment === 'error' ? 'text-red-800' :
                    statusDef.sentiment === 'warning' ? 'text-amber-800' :
                    'text-gray-800'
                }`}>
                    {statusDef.title}
                </h2>
                <p className="text-gray-700 text-xs font-medium mt-1">{statusDef.description}</p>
                <div className="mt-2 inline-block px-1.5 py-0.5 bg-white/60 rounded text-[10px] font-mono text-gray-600 border border-black/5">
                    Code: {mainStatus.productApplicationStatusCode}
                </div>
            </div>
            
            {statusDef.sentiment === 'success' && <CheckCircle2 className="w-6 h-6 text-green-600" />}
            {(statusDef.sentiment === 'warning' || statusDef.sentiment === 'error') && (
                <ShieldAlert className={`w-6 h-6 ${statusDef.sentiment === 'error' ? 'text-red-600' : 'text-amber-600'}`} />
            )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3">
        <InfoCard
          label="Reference #"
          value={mainStatus.decisionEngineReferenceIdentifier || appData.customerFacingApplicationIdentifier || "N/A"}
          copyable
          tooltip="Quote this to the agent."
        />
        <InfoCard
          label="Updated"
          value={getTimeAgo(mainStatus.productApplicationStatusChangeTimestamp)}
          subValue={formatDate(mainStatus.productApplicationStatusChangeTimestamp)}
          tooltip="Last system update time."
        />
      </div>

      {/* Recon Section (Only for actionable items) */}
      {isActionable && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-chase-navy px-3 py-2 flex items-center gap-2">
                <Phone className="w-3 h-3 text-white" />
                <h3 className="text-white text-xs font-semibold">Reconsideration Lines</h3>
            </div>
            <div className="p-3 grid gap-2">
                {RECON_NUMBERS.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-gray-50 last:border-0 pb-1 last:pb-0">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">{item.label}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gray-800 select-all">{item.number}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Errors */}
      {(mainStatus.statusAdditionalInformation?.errors?.length || 0) > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h3 className="text-xs font-bold text-red-800 mb-2 uppercase">Errors Detected</h3>
            <div className="space-y-1">
                {mainStatus.statusAdditionalInformation?.errors?.map((err, idx) => (
                    <div key={idx} className="bg-white px-2 py-1 rounded border border-red-100 text-red-700 font-mono text-xs flex justify-between">
                        <span>{err.errorCode}</span>
                        <a href={`https://www.google.com/search?q=Chase+error+code+${err.errorCode}`} target="_blank" className="underline opacity-70">Search</a>
                    </div>
                ))}
            </div>
        </div>
      )}

      <DocumentStatus
          pendInfo={mainStatus.pendRequiredInformation}
          actionList={mainStatus.statusAdditionalInformation?.requiredActionList}
      />

      {/* Meta Data */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Details</h3>
        <div className="space-y-1 text-xs">
            <MetaRow label="Product Type" value={appData.cardAccountStatus ? 'Credit Card' : 'Bank/Deposit'} />
            <MetaRow label="Product Code" value={`${mainStatus.productCode} (${mainStatus.subProductCode})`} />
            <MetaRow label="Source" value={mainStatus.acquisitionSourceName || '-'} />
            <MetaRow label="App ID" value={appData.productApplicationIdentifier} truncate />
            <MetaRow label="Created" value={formatDate(appData.applicationCreateTimestamp)} />
        </div>
      </div>

      <RawViewer data={appData} />
    </div>
  );
};

// Helper to extract the most relevant status object from the application wrapper
function getPrimaryStatus(app: ChaseApplicationData): GenericAccountStatus | undefined {
    return app.cardAccountStatus?.[0] || 
           app.enrollmentProductStatus?.[0] || 
           app.depositAccountStatus?.[0] || 
           app.lendingAccountStatus?.[0] || 
           app.investmentAccountStatus?.[0];
}

function getStatusInfo(statusCode?: string) {
    if (!statusCode) return { title: 'Unknown', description: 'No status code', sentiment: 'neutral' as const };
    return STATUS_DEFINITIONS[statusCode] || { 
        title: statusCode, 
        description: "Status Code", 
        sentiment: 'neutral' as const 
    };
}

const MetaRow: React.FC<{ label: string; value: string; truncate?: boolean }> = ({ label, value, truncate }) => (
    <div className="flex justify-between items-center">
        <span className="text-gray-500">{label}</span>
        <span className={`font-mono text-gray-900 ${truncate ? 'max-w-[150px] truncate' : ''}`} title={value}>{value}</span>
    </div>
);

function formatDate(isoString?: string) {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString(undefined, { month:'numeric', day:'numeric', year:'2-digit' });
}

function getTimeAgo(isoString?: string) {
    if (!isoString) return '';
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
}