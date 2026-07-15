import type { HostStatus } from '../utils/mockData';

interface IntegrityGaugeProps {
  percentage: number;
  status: HostStatus;
}

export default function IntegrityGauge({ percentage, status }: IntegrityGaugeProps) {
  const radius = 50;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let color = "#45D9C4"; // Stable
  let textClass = "text-stable text-glow-stable";

  if (status === 'watch') {
    color = "#B58BFF";
    textClass = "text-alert text-glow-alert";
  } else if (status === 'critical') {
    color = "#FF5C5C";
    textClass = "text-critical text-glow-critical";
  } else if (status === 'emergence') {
    color = "#B58BFF"; // Emergence shifting
    textClass = "text-[#F2FBFA] text-glow-emergence";
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full relative">
      <div className="relative flex items-center justify-center">
        {/* Radial SVG Ring */}
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="rgba(255, 255, 255, 0.05)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`font-mono text-2xl font-black tracking-tighter ${textClass}`}>
            {percentage}%
          </span>
          <span className="text-[7px] font-mono text-gray-500 uppercase tracking-widest">
            INTEGRITY
          </span>
        </div>
      </div>
      
      {/* Mini status text */}
      <div className="mt-2 text-center">
        <span className="text-[8px] font-mono text-gray-500 uppercase block">FUSION BALANCE</span>
        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
          status === 'stable' ? 'text-stable' :
          status === 'watch' ? 'text-alert' :
          status === 'critical' ? 'text-critical' : 'text-[#F2FBFA]'
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
}
