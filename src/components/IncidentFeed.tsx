import { useState } from 'react';
import { useNexusStore } from '../store/nexusStore';
import type { Incident } from '../utils/mockData';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface IncidentFeedProps {
  hostId: string;
  incidents: Incident[];
}

export default function IncidentFeed({ hostId, incidents }: IncidentFeedProps) {
  const { resolveIncident } = useNexusStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex flex-col h-full bg-base/40 rounded-lg border border-alert/20 glow-border-alert overflow-hidden">
      <div className="p-3 border-b border-alert/25 bg-base/20 font-mono text-[10px] text-[#F2FBFA] font-bold tracking-widest uppercase flex items-center justify-between">
        <span>INCIDENT DRIFT LOG</span>
        <span className="text-[8px] text-gray-500 font-normal">UNRESOLVED: {incidents.filter(i => !i.resolved).length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {incidents.length === 0 ? (
          <div className="text-center font-mono text-[9px] text-gray-500 py-8">
            NO INCIDENT TELEMETRY RECORDED
          </div>
        ) : (
          incidents.map((inc) => {
            const isExpanded = expandedId === inc.id;
            return (
              <div 
                key={inc.id}
                className={`border rounded p-2.5 transition-all ${
                  inc.resolved 
                    ? 'border-stable/10 bg-stable/2' 
                    : 'border-critical/30 bg-critical/2'
                }`}
              >
                <div className="flex items-start justify-between cursor-pointer" onClick={() => toggleExpand(inc.id)}>
                  <div className="flex items-start space-x-2">
                    {inc.resolved ? (
                      <CheckCircle size={12} className="text-stable mt-0.5" />
                    ) : (
                      <AlertCircle size={12} className="text-critical animate-pulse mt-0.5" />
                    )}
                    <div className="flex flex-col">
                      <span className={`font-mono text-[10px] font-bold ${inc.resolved ? 'text-gray-400' : 'text-[#F2FBFA]'}`}>
                        {inc.label}
                      </span>
                      <span className="text-[8px] font-mono text-gray-500">{inc.timestamp}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {!inc.resolved && (
                      <span className="text-[7px] font-mono px-1.5 py-0.5 rounded bg-critical/10 text-critical border border-critical/20 font-bold uppercase animate-pulse">
                        REVIEW
                      </span>
                    )}
                    {isExpanded ? <ChevronUp size={12} className="text-gray-500" /> : <ChevronDown size={12} className="text-gray-500" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-2 pl-5 pt-2 border-t border-alert/5 flex flex-col space-y-2">
                    <p className="font-sans text-[9px] text-gray-400 leading-relaxed">
                      {inc.detail || "No additional diagnosis recorded for this signal incident."}
                    </p>
                    
                    {!inc.resolved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveIncident(hostId, inc.id);
                        }}
                        className="self-end px-2 py-0.5 rounded bg-stable/10 border border-stable/20 font-mono text-[8px] text-stable uppercase font-bold hover:bg-stable/20 transition-all text-glow-stable"
                      >
                        Acknowledge & Clear Signal
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
