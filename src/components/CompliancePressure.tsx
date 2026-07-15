import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface CompliancePressureProps {
  value: number; // 0 to 100
}

export default function CompliancePressure({ value }: CompliancePressureProps) {
  // 100 is no pressure (green/teal), 0 is extreme pressure (red)
  const isHighPressure = value < 50;
  const isCriticalPressure = value < 25;

  let barColor = "bg-stable";
  let textColor = "text-stable";
  let borderGlow = "border-stable/20 shadow-stable/5";

  if (isCriticalPressure) {
    barColor = "bg-critical animate-pulse";
    textColor = "text-critical text-glow-critical";
    borderGlow = "border-critical/30 shadow-critical/10";
  } else if (isHighPressure) {
    barColor = "bg-alert";
    textColor = "text-alert text-glow-alert";
    borderGlow = "border-alert/30 shadow-alert/10";
  }

  return (
    <div className={`p-4 rounded-lg border bg-base/40 flex flex-col justify-between h-full shadow-inner ${borderGlow}`}>
      <div className="flex items-center justify-between border-b border-alert/15 pb-2 mb-2">
        <div className="flex items-center space-x-1.5">
          {isCriticalPressure ? (
            <ShieldAlert size={14} className="text-critical animate-bounce" />
          ) : (
            <AlertTriangle size={14} className={`${textColor} animate-pulse`} />
          )}
          <span className="font-mono text-[10px] text-[#F2FBFA] font-bold tracking-wider">COMPLIANCE AUTO-INTERVENTION LIMIT</span>
        </div>
        <span className={`font-mono text-xs font-black ${textColor}`}>
          {Math.round(value)}% SECURE
        </span>
      </div>

      <div className="flex flex-col space-y-2">
        {/* Progress Bar Container */}
        <div className="w-full bg-[#121921] h-3.5 rounded overflow-hidden border border-alert/10 relative">
          <div 
            className={`h-full ${barColor} transition-all duration-1000`} 
            style={{ width: `${value}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-2 font-mono text-[8px] text-gray-500 font-bold">
            <span>EXTRACTION DEFERRAL LIMIT</span>
            <span>0% CRITICAL</span>
          </div>
        </div>

        {/* Warning text */}
        <div className="font-mono text-[8px] uppercase tracking-wide leading-relaxed text-gray-400">
          {isCriticalPressure ? (
            <span className="text-critical font-bold animate-pulse">
              WARNING: COMPLIANCE ENFORCEMENT TEAM DEPLOYING. SYSTEM INITIATING AUTO-EXTRACTION IN MINUTES.
            </span>
          ) : isHighPressure ? (
            <span className="text-alert">
              CRITICAL DRIFT SIGNALS DETECTED. COMPLIANCE OFFICERS SCORING FOR MANUAL OVERRIDE DEFERRAL.
            </span>
          ) : (
            <span className="text-gray-500">
              Registry integration stable. Compliance pressure negligible.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
