import { useNexusStore } from '../store/nexusStore';
import type { Host } from '../utils/mockData';
import { ShieldAlert, Zap, Skull, RotateCcw } from 'lucide-react';

interface QuickActionsProps {
  host: Host;
}

export default function QuickActions({ host }: QuickActionsProps) {
  const { 
    sedateHost, 
    extractHost, 
    flagHost, 
    recalibrateHost, 
    recalibratingHostId,
    recalibrateResult,
    clearRecalibrateState
  } = useNexusStore();

  const isRecalibrating = recalibratingHostId === host.id;
  const isEmergence = host.status === 'emergence';
  const isPending = host.isPendingExtraction;

  return (
    <div className="bg-base/40 rounded-lg border border-alert/20 p-4 flex flex-col justify-between h-full glow-border-alert relative overflow-hidden">
      {/* Recalibration Outcome Overlay */}
      {isRecalibrating && (
        <div className="absolute inset-0 bg-base/95 backdrop-blur z-20 flex flex-col items-center justify-center p-4 text-center font-mono">
          {!recalibrateResult ? (
            <div className="flex flex-col items-center space-y-3">
              <RotateCcw className="w-8 h-8 text-alert animate-spin" />
              <div className="text-xs font-bold text-alert text-glow-alert animate-pulse uppercase">
                RECALIBRATING NEURAL CORRIDOR
              </div>
              <div className="text-[8px] text-gray-500 max-w-[200px]">
                Modulating synaptic frequency... Gamble parameters active. Compliance override deferred.
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className={`text-sm font-bold uppercase tracking-wider ${
                recalibrateResult === 'stabilized' ? 'text-stable text-glow-stable' :
                recalibrateResult === 'partial' ? 'text-alert text-glow-alert' :
                'text-critical text-glow-critical'
              }`}>
                {recalibrateResult === 'stabilized' && "Recalibration Successful"}
                {recalibrateResult === 'partial' && "Partial Convergence Achieved"}
                {recalibrateResult === 'collapsed' && "Neural Corridor Collapsed"}
              </div>
              <p className="text-[9px] text-gray-400 max-w-[220px] leading-relaxed">
                {recalibrateResult === 'stabilized' && "Host fusion integrity has stabilized at 95%. Standard telemetry resumed."}
                {recalibrateResult === 'partial' && "Synaptic alignment partly succeeded. Watch status remains active."}
                {recalibrateResult === 'collapsed' && "Severe feedback loop. Integrations failing. Immediate extraction advised."}
              </p>
              <button
                onClick={clearRecalibrateState}
                className="px-4 py-1.5 rounded bg-alert/20 border border-alert/30 text-[#F2FBFA] text-[10px] uppercase font-bold hover:bg-alert/30 transition-all"
              >
                Acknowledge
              </button>
            </div>
          )}
        </div>
      )}

      <div>
        <div className="border-b border-alert/15 pb-2 mb-3">
          <span className="font-mono text-[10px] text-[#F2FBFA] font-bold tracking-widest uppercase">
            QUICK INTERVENTION ACTIONS
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Action 1: Sedate */}
          <button
            disabled={isPending}
            onClick={() => sedateHost(host.id)}
            className="flex flex-col items-center justify-center p-3 rounded border border-alert/20 bg-alert/5 hover:bg-alert/10 transition-all font-mono disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <Zap className="w-5 h-5 text-alert group-hover:scale-110 transition-transform mb-1.5" />
            <span className="text-[10px] font-bold text-[#F2FBFA] uppercase">Sedate Fusion</span>
            <span className="text-[7px] text-gray-500 uppercase mt-0.5">Flatten Bio Sync</span>
          </button>

          {/* Action 2: Flag */}
          <button
            disabled={isPending}
            onClick={() => flagHost(host.id)}
            className="flex flex-col items-center justify-center p-3 rounded border border-stable/20 bg-stable/5 hover:bg-stable/10 transition-all font-mono disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <ShieldAlert className="w-5 h-5 text-stable group-hover:scale-110 transition-transform mb-1.5 text-glow-stable" />
            <span className="text-[10px] font-bold text-[#F2FBFA] uppercase">Flag Review</span>
            <span className="text-[7px] text-gray-500 uppercase mt-0.5">Freeze Logs</span>
          </button>

          {/* Action 3: Recalibrate (Emergence only) */}
          <button
            disabled={!isEmergence || isPending}
            onClick={() => recalibrateHost(host.id)}
            className={`flex flex-col items-center justify-center p-3 rounded border font-mono transition-all group relative overflow-hidden ${
              isEmergence && !isPending
                ? 'border-alert/50 bg-gradient-to-br from-alert/10 to-stable/10 hover:from-alert/20 hover:to-stable/20 cursor-pointer glow-border-emergence'
                : 'border-gray-500/10 bg-gray-500/5 opacity-25 cursor-not-allowed'
            }`}
          >
            <RotateCcw className={`w-5 h-5 mb-1.5 ${isEmergence && !isPending ? 'text-alert animate-spin duration-3000' : 'text-gray-500'}`} />
            <span className="text-[10px] font-bold text-[#F2FBFA] uppercase">Recalibrate</span>
            <span className="text-[7px] text-gray-500 uppercase mt-0.5">
              {isEmergence ? 'Clinical Gamble' : 'Emergence Only'}
            </span>
          </button>

          {/* Action 4: Extract */}
          <button
            disabled={isPending}
            onClick={() => extractHost(host.id)}
            className="flex flex-col items-center justify-center p-3 rounded border border-critical/30 bg-critical/5 hover:bg-critical/15 transition-all font-mono disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <Skull className="w-5 h-5 text-critical group-hover:scale-110 transition-transform mb-1.5 text-glow-critical" />
            <span className="text-[10px] font-bold text-[#F2FBFA] uppercase">Extract</span>
            <span className="text-[7px] text-gray-500 uppercase mt-0.5">Schedule Removal</span>
          </button>
        </div>
      </div>

      <div className="mt-2 text-[7px] font-mono text-gray-500 leading-normal text-center">
        REGISTRY SECURE INTERLOCK ACTIVE // MED-ID CALIBRATED
      </div>
    </div>
  );
}
