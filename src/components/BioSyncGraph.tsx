import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import type { BioSyncPoint } from '../utils/mockData';

interface BioSyncGraphProps {
  data: BioSyncPoint[];
}

export default function BioSyncGraph({ data }: BioSyncGraphProps) {
  // Format timestamps for chart labels
  const formattedData = data.map((pt) => ({
    ...pt,
    timeLabel: new Date(pt.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
  }));

  return (
    <div className="w-full h-full min-h-[160px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="timeLabel" 
            stroke="rgba(181, 139, 255, 0.3)" 
            tick={{ fill: '#94A3B8', fontSize: 8, fontFamily: 'monospace' }}
          />
          <YAxis 
            domain={[40, 180]} 
            stroke="rgba(181, 139, 255, 0.3)" 
            tick={{ fill: '#94A3B8', fontSize: 8, fontFamily: 'monospace' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0B1015',
              borderColor: 'rgba(181, 139, 255, 0.3)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '10px',
              color: '#F2FBFA',
            }}
          />
          <Line
            type="monotone"
            dataKey="heartRate"
            name="HR (bpm)"
            stroke="#FF5C5C"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="neuralSync"
            name="Neural Sync (%)"
            stroke="#45D9C4"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
