import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { NeurograftClass, HostStatus } from '../utils/mockData';
import { getStatusColor } from './Neurograft3D';
import { Activity, Thermometer, ShieldAlert, Check } from 'lucide-react';

interface InteriorView3DProps {
  type: NeurograftClass;
  status: HostStatus;
}

interface GeneDot {
  id: string;
  name: string;
  pos: [number, number, number];
  status: "nominal" | "warning" | "critical";
  driftValue: number;
  trend: number[];
}

// Custom unique Neuro-Corridor Scan structure (instead of reusing external model)
function InteriorCorridorScan({ 
  status, 
  rotationSpeed,
  renderMode
}: { 
  status: HostStatus; 
  rotationSpeed: number; 
  renderMode: "hologram" | "wireframe" | "point-cloud" 
}) {
  const cylinderRef = useRef<THREE.Mesh>(null);
  const torusKnotRef = useRef<THREE.Mesh>(null);
  const helixRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const speed = rotationSpeed;

    if (cylinderRef.current) {
      cylinderRef.current.rotation.y = elapsed * 0.1 * speed;
    }
    if (torusKnotRef.current) {
      torusKnotRef.current.rotation.x = elapsed * 0.2 * speed;
      torusKnotRef.current.rotation.y = -elapsed * 0.15 * speed;
    }
    if (helixRef.current) {
      helixRef.current.rotation.y = -elapsed * 0.25 * speed;
    }
  });

  const activeColor = getStatusColor(status, 0);
  const isWire = renderMode === 'wireframe';
  const isPoints = renderMode === 'point-cloud';

  return (
    <group>
      {/* 1. Translucent Neural Cylinder Corridor */}
      {isPoints ? (
        <points ref={cylinderRef}>
          <cylinderGeometry args={[0.9, 0.9, 3.2, 16, 8, true]} />
          <pointsMaterial color={activeColor} size={0.04} sizeAttenuation />
        </points>
      ) : (
        <mesh ref={cylinderRef}>
          <cylinderGeometry args={[0.9, 0.9, 3.2, 24, 1, true]} />
          <meshStandardMaterial 
            color={activeColor} 
            transparent 
            opacity={isWire ? 0.35 : 0.15} 
            wireframe={isWire}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 2. Synaptic Torus Knot - Complex organic core */}
      {!isPoints && (
        <mesh ref={torusKnotRef} position={[0, 0, 0]}>
          <torusKnotGeometry args={[0.5, 0.05, 64, 8, 3, 5]} />
          <meshStandardMaterial 
            color={activeColor} 
            roughness={0.1}
            metalness={0.9}
            emissive={activeColor}
            emissiveIntensity={0.4}
            wireframe={isWire}
          />
        </mesh>
      )}

      {/* 3. Helix Scanner Rings */}
      <group ref={helixRef}>
        {Array.from({ length: 4 }).map((_, idx) => {
          const yPos = -1.2 + (idx * 0.8);
          return (
            <mesh key={idx} position={[0, yPos, 0]} rotation={[Math.PI / 2, 0, 0]}>
              {isPoints ? (
                <points>
                  <torusGeometry args={[1.1, 0.02, 6, 32]} />
                  <pointsMaterial color={activeColor} size={0.03} sizeAttenuation />
                </points>
              ) : (
                <mesh>
                  <torusGeometry args={[1.1, 0.012, 8, 36]} />
                  <meshBasicMaterial color={activeColor} transparent opacity={0.35} wireframe={isWire} />
                </mesh>
              )}
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

// Orbiting satellite ring for Gene-Dot
function StylizedGeneDotRing({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 1.5;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.8;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[0.2, 0.012, 6, 18]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

export default function InteriorView3D({ type, status }: InteriorView3DProps) {
  const [selectedDot, setSelectedDot] = useState<GeneDot | null>(null);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0);
  const [renderMode, setRenderMode] = useState<"hologram" | "wireframe" | "point-cloud">("hologram");

  const [dots, setDots] = useState<GeneDot[]>([
    { id: "dot-1", name: "SYNAPSE-ALGN", pos: [0.5, 0.6, 0.4], status: "nominal", driftValue: 12, trend: [10, 11, 14, 12, 11, 12] },
    { id: "dot-2", name: "MEM-TUNNEL", pos: [-0.6, 0.2, 0.8], status: "warning", driftValue: 45, trend: [20, 30, 42, 38, 41, 45] },
    { id: "dot-3", name: "MOTR-CORTEX", pos: [0.7, -0.5, -0.5], status: "nominal", driftValue: 18, trend: [18, 17, 19, 18, 18, 18] },
    { id: "dot-4", name: "VASC-INTERFLOW", pos: [-0.3, -0.8, -0.2], status: status === "critical" ? "critical" : "nominal", driftValue: status === "critical" ? 82 : 22, trend: [20, 25, 45, 60, 75, 82] }
  ]);

  const [patching, setPatching] = useState(false);

  const handlePatch = (dotId: string) => {
    setPatching(true);
    setTimeout(() => {
      setDots(prev => prev.map(d => {
        if (d.id === dotId) {
          return {
            ...d,
            status: "nominal",
            driftValue: 8,
            trend: [...d.trend, 8]
          };
        }
        return d;
      }));
      setSelectedDot(prev => prev && prev.id === dotId ? { ...prev, status: "nominal", driftValue: 8 } : prev);
      setPatching(false);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full min-h-[350px]">
      
      {/* 3D Visualizer Viewport */}
      <div className="lg:col-span-2 relative bg-base/40 rounded-lg border border-alert/20 overflow-hidden glow-border-alert h-[450px] lg:h-auto flex flex-col justify-between">
        <div className="absolute top-2 left-2 z-10 font-mono text-[9px] text-alert bg-base/80 p-2 rounded border border-alert/20">
          NEURO-CORRIDOR SCAN // CHOOSE SATELLITE DOT TO TRIGGER ABLATION
        </div>

        <div className="flex-1 w-full relative">
          <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <directionalLight position={[0, 5, 5]} intensity={1} />
            
            {/* Custom corridor scanner */}
            <InteriorCorridorScan status={status} rotationSpeed={rotationSpeed} renderMode={renderMode} />
            
            {/* Stylized Gene Dots */}
            {dots.map((dot) => {
              let color = "#45D9C4"; // Nominal
              if (dot.status === 'warning') color = "#B58BFF";
              if (dot.status === 'critical') color = "#FF5C5C";

              return (
                <group key={dot.id} position={dot.pos}>
                  {/* Pinned main dot */}
                  <mesh onClick={() => setSelectedDot(dot)}>
                    <sphereGeometry args={[0.09, 16, 16]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
                  </mesh>

                  {/* Satellite orbital tech ring around dot */}
                  <StylizedGeneDotRing color={color} />

                  <Html distanceFactor={4.5}>
                    <button 
                      onClick={() => setSelectedDot(dot)}
                      className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-base/90 border font-mono text-[8px] hover:scale-105 transition-all text-[#F2FBFA]"
                      style={{ borderColor: color }}
                    >
                      <span className="w-1 h-1 rounded-full pulse-slow" style={{ backgroundColor: color }}></span>
                      <span>{dot.name}</span>
                    </button>
                  </Html>
                </group>
              );
            })}

            <OrbitControls enableZoom={true} enablePan={false} />
          </Canvas>
        </div>

        {/* Speed and Render Controls bar */}
        <div className="w-full flex items-center justify-between gap-3 bg-[#0A1020]/80 border-t border-alert/20 p-2 z-10">
          <div className="flex items-center gap-2 font-mono text-[8px] text-readout/70">
            <span>ROTATION: {rotationSpeed.toFixed(1)}x</span>
            <input 
              type="range" 
              min="0" 
              max="2.5" 
              step="0.1" 
              value={rotationSpeed} 
              onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
              className="w-20 h-1 bg-alert/20 rounded-lg appearance-none cursor-pointer accent-alert"
            />
          </div>
          <div className="flex gap-1">
            {(["hologram", "wireframe", "point-cloud"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setRenderMode(mode)}
                className={`px-2 py-0.5 rounded font-mono text-[8px] uppercase tracking-wider border transition-all ${
                  renderMode === mode 
                    ? 'bg-alert/20 border-alert text-alert text-glow-alert font-bold'
                    : 'bg-transparent border-alert/10 text-readout/40 hover:text-readout/70'
                }`}
              >
                {mode.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gene Dot Detail Panel */}
      <div className="bg-base/60 rounded-lg border border-alert/20 p-4 flex flex-col justify-between glow-border-alert">
        {selectedDot ? (
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-alert/20 pb-2 mb-3">
                <span className="font-mono text-xs text-[#F2FBFA] font-bold tracking-wider">{selectedDot.name}</span>
                <span className={`font-mono text-[9px] px-2 py-0.5 rounded uppercase font-semibold ${
                  selectedDot.status === 'nominal' ? 'bg-stable/10 text-stable border border-stable/20' :
                  selectedDot.status === 'warning' ? 'bg-alert/10 text-alert border border-alert/20' :
                  'bg-critical/10 text-critical border border-critical/20'
                }`}>
                  {selectedDot.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-[10px]">
                <div className="border border-alert/10 p-2 rounded">
                  <div className="text-gray-400 text-[8px] uppercase">Drift Value</div>
                  <div className="text-lg font-bold text-[#F2FBFA]">{selectedDot.driftValue}%</div>
                </div>
                <div className="border border-alert/10 p-2 rounded">
                  <div className="text-gray-400 text-[8px] uppercase">Synaptic Flow</div>
                  <div className="text-lg font-bold text-[#F2FBFA]">
                    {selectedDot.status === 'nominal' ? 'OPTIMAL' : selectedDot.status === 'warning' ? 'DEVIATING' : 'CRITICAL'}
                  </div>
                </div>
              </div>

              {/* Sparkline Trend Graph */}
              <div className="mb-4">
                <div className="font-mono text-[8px] uppercase text-gray-400 mb-1 flex items-center justify-between">
                  <span>Ablation Drift Trend (60s)</span>
                  <Activity size={10} className="text-alert animate-pulse" />
                </div>
                <div className="h-16 border border-alert/10 rounded flex items-end justify-between px-2 py-1 bg-[#05080c]">
                  {selectedDot.trend.map((val, idx) => (
                    <div 
                      key={idx}
                      className="w-4 rounded-t-sm"
                      style={{ 
                        height: `${val}%`, 
                        backgroundColor: selectedDot.status === 'critical' ? '#FF5C5C' : selectedDot.status === 'warning' ? '#B58BFF' : '#45D9C4',
                        opacity: 0.4 + (idx / 10) 
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <button
                disabled={selectedDot.status === 'nominal' || patching}
                onClick={() => handlePatch(selectedDot.id)}
                className={`w-full py-2 rounded font-mono text-xs uppercase flex items-center justify-center space-x-2 transition-all ${
                  selectedDot.status === 'nominal' 
                    ? 'bg-stable/10 text-stable/60 cursor-not-allowed border border-stable/20' 
                    : patching 
                    ? 'bg-alert/20 text-alert animate-pulse border border-alert/40' 
                    : 'bg-alert/20 hover:bg-alert/30 text-[#F2FBFA] border border-alert/40'
                }`}
              >
                {patching ? (
                  <>
                    <Activity size={12} className="animate-spin" />
                    <span>Calibrating Ablation...</span>
                  </>
                ) : selectedDot.status === 'nominal' ? (
                  <>
                    <Check size={12} />
                    <span>Alignment Complete</span>
                  </>
                ) : (
                  <>
                    <Thermometer size={12} />
                    <span>Trigger Local Ablation</span>
                  </>
                )}
              </button>
              {selectedDot.status !== 'nominal' && (
                <div className="mt-2 text-[8px] text-critical flex items-center space-x-1 font-mono">
                  <ShieldAlert size={8} />
                  <span>Ablation gamble may destabilize other connections.</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center font-mono py-8">
            <Activity size={24} className="text-alert/40 mb-2 animate-pulse" />
            <div className="text-[10px] text-alert/60 uppercase">NO MARKER SELECTED</div>
            <div className="text-[9px] text-gray-500 max-w-[150px] mt-1">Select a floating node in the 3D overlay to begin diagnostic ablation.</div>
          </div>
        )}
      </div>
    </div>
  );
}
