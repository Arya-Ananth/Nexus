import { useNexusStore } from '../store/nexusStore';
import type { HostStatus } from '../utils/mockData';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function HostRoster() {
  const { hosts, selectedHostId, selectHost } = useNexusStore();

  // Helper to determine sorting weight
  const getSortWeight = (status: HostStatus, isPendingExtraction?: boolean) => {
    if (isPendingExtraction) return 4; // Move pending extractions to bottom of list
    if (status === 'emergence') return 0;
    if (status === 'critical') return 1;
    if (status === 'watch') return 2;
    return 3;
  };

  const sortedHosts = [...hosts].sort((a, b) => {
    const wA = getSortWeight(a.status, a.isPendingExtraction);
    const wB = getSortWeight(b.status, b.isPendingExtraction);
    if (wA !== wB) return wA - wB;
    return a.id.localeCompare(b.id);
  });

  return (
    <aside className="w-80 h-full border-r border-alert/20 bg-base/40 flex flex-col z-10">
      <div className="p-4 border-b border-alert/20 flex items-center justify-between font-mono bg-base/20">
        <span className="text-xs font-bold tracking-wider text-[#F2FBFA] uppercase">Active Host Roster</span>
        <span className="text-[9px] text-gray-500 font-mono">COUNT: {hosts.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-alert/10">
        {sortedHosts.map((host) => {
          const isSelected = host.id === selectedHostId;
          const { status, isPendingExtraction, neurograftClass } = host;

          // Determine status badges and coloring
          let statusLabel = status.toUpperCase();
          let pillClass = "";
          let hoverClass = "";

          if (isPendingExtraction) {
            statusLabel = "EXTRACTING";
            pillClass = "bg-gray-500/10 text-gray-400 border border-gray-500/20";
            hoverClass = "hover:bg-gray-500/5";
          } else if (status === 'stable') {
            pillClass = "bg-stable/10 text-stable border border-stable/20 text-glow-stable";
            hoverClass = "hover:bg-stable/5";
          } else if (status === 'watch') {
            pillClass = "bg-alert/10 text-alert border border-alert/20 text-glow-alert";
            hoverClass = "hover:bg-alert/5";
          } else if (status === 'critical') {
            pillClass = "bg-critical/10 text-critical border border-critical/20 text-glow-critical animate-pulse";
            hoverClass = "hover:bg-critical/5";
          } else if (status === 'emergence') {
            pillClass = "bg-gradient-to-r from-stable/10 to-alert/10 text-[#F2FBFA] border border-alert/40 text-glow-emergence";
            hoverClass = "hover:bg-alert/5";
          }

          return (
            <div
              key={host.id}
              onClick={() => selectHost(host.id)}
              className={`p-4 cursor-pointer transition-all flex flex-col space-y-2 border-l-2 ${
                isSelected 
                  ? 'bg-alert/10 border-alert' 
                  : `border-transparent ${hoverClass}`
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-[#F2FBFA] tracking-wide">{host.id}</span>
                  {host.name && (
                    <span className="text-[10px] text-gray-400 font-sans truncate max-w-[100px]">{host.name}</span>
                  )}
                </div>
                <div className="flex items-center space-x-1.5">
                  {status === 'emergence' && <RefreshCw size={10} className="text-alert animate-spin" />}
                  {status === 'critical' && <ShieldAlert size={10} className="text-critical" />}
                  <span className={`text-[8px] px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider ${pillClass}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between font-mono text-[9px] text-gray-500">
                <span className="capitalize">{neurograftClass.replace("-", " ")}</span>
                <span className={`font-semibold ${
                  isPendingExtraction ? 'text-gray-400' :
                  status === 'stable' ? 'text-stable' :
                  status === 'watch' ? 'text-alert' :
                  status === 'critical' ? 'text-critical' : 'text-alert text-glow-emergence'
                }`}>
                  FUSION: {host.fusionIntegrity}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
