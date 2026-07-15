import { useNexusStore } from '../store/nexusStore';
import { Activity, Clock, ShieldAlert, Zap } from 'lucide-react';

export default function Topbar() {
  const { shiftStatus, alertCount, toggleShiftStatus } = useNexusStore();

  return (
    <header className="h-16 border-b border-alert/20 bg-base/80 backdrop-blur flex items-center justify-between px-6 z-20 glow-border-alert relative">
      {/* Brand / Logo */}
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full border border-stable bg-stable/5 glow-border-stable">
          <Zap className="w-4 h-4 text-stable text-glow-stable animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold tracking-widest text-[#F2FBFA] text-glow-stable">NEXUS SYSTEM</span>
          <span className="text-[8px] font-mono text-gray-500 uppercase">NEURAL INTEGRATION REGISTRY v2.91</span>
        </div>
      </div>

      {/* Shift status & Alerts */}
      <div className="flex items-center space-x-6">
        {/* Shift Control */}
        <button 
          onClick={toggleShiftStatus}
          className={`flex items-center space-x-2 px-3 py-1 rounded border font-mono text-[10px] uppercase font-bold tracking-wider transition-all ${
            shiftStatus === 'ACTIVE' 
              ? 'bg-stable/10 border-stable/30 text-stable hover:bg-stable/20 text-glow-stable' 
              : 'bg-critical/10 border-critical/30 text-critical hover:bg-critical/20 text-glow-critical'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${shiftStatus === 'ACTIVE' ? 'animate-pulse' : ''}`} />
          <span>SHIFT: {shiftStatus}</span>
        </button>

        {/* Live Active Alert Tracker */}
        <div className="flex items-center space-x-2 border border-alert/20 bg-alert/5 px-3 py-1 rounded font-mono text-[10px] text-alert text-glow-alert">
          <ShieldAlert className="w-3.5 h-3.5 animate-bounce" />
          <span>ACTIVE ALERTS: {alertCount < 10 ? `0${alertCount}` : alertCount}</span>
        </div>
      </div>

      {/* Medic ID Badge */}
      <div className="flex items-center space-x-3 border-l border-alert/15 pl-6 font-mono">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-[#F2FBFA]">DR. AMA REYES</span>
          <span className="text-[8px] text-gray-500 uppercase">SYNTH-MEDIC // CAD-918</span>
        </div>
        <div className="relative w-9 h-9 rounded-full bg-[#1b2530] border border-alert/40 flex items-center justify-center overflow-hidden">
          <Activity size={18} className="text-alert text-glow-alert pulse-slow" />
          <div className="absolute inset-0 border border-t-transparent border-l-transparent border-alert rounded-full animate-spin duration-3000"></div>
        </div>
      </div>
    </header>
  );
}
