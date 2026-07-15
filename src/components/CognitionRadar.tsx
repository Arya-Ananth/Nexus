import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import type { CognitionDrift } from '../utils/mockData';

interface CognitionRadarProps {
  drift: CognitionDrift;
}

export default function CognitionRadar({ drift }: CognitionRadarProps) {
  // Format data for Recharts Radar
  const data = [
    { subject: 'Memory', current: drift.current.memory, threeDaysAgo: drift.threeDaysAgo.memory },
    { subject: 'Mood', current: drift.current.mood, threeDaysAgo: drift.threeDaysAgo.mood },
    { subject: 'Impulse Control', current: drift.current.impulseControl, threeDaysAgo: drift.threeDaysAgo.impulseControl },
    { subject: 'Identity Continuity', current: drift.current.identityContinuity, threeDaysAgo: drift.threeDaysAgo.identityContinuity }
  ];

  return (
    <div className="w-full h-full min-h-[180px] relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
          <PolarGrid stroke="rgba(181, 139, 255, 0.15)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#E2E8F0', fontSize: 8, fontFamily: 'monospace' }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: '#94A3B8', fontSize: 6, fontFamily: 'monospace' }}
            stroke="rgba(181, 139, 255, 0.1)"
          />
          <Radar
            name="3 Days Ago"
            dataKey="threeDaysAgo"
            stroke="rgba(69, 217, 196, 0.5)"
            fill="#45D9C4"
            fillOpacity={0.15}
          />
          <Radar
            name="Current Drift"
            dataKey="current"
            stroke="#B58BFF"
            fill="#B58BFF"
            fillOpacity={0.3}
          />
          <Legend 
            wrapperStyle={{ fontSize: '8px', fontFamily: 'monospace', color: '#94A3B8' }}
            iconSize={6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
