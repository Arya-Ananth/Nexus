import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { GenomeNode, HostStatus } from '../utils/mockData';

interface GenomeMap3DProps {
  nodes: GenomeNode[];
  status: HostStatus;
  onNodeClick: (nodeId: string) => void;
}

function GenomeGraph({ 
  nodes, 
  status, 
  onNodeClick,
  rotationSpeed,
  renderMode,
  selectedNodeId,
  setSelectedNodeId
}: GenomeMap3DProps & { 
  rotationSpeed: number; 
  renderMode: "hologram" | "wireframe" | "point-cloud";
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05 * rotationSpeed;
    }
  });

  const nodeColor = useMemoColor(status);

  // Line points connecting nodes
  const linePoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    nodes.forEach((node) => {
      const start = new THREE.Vector3(node.x, node.y, node.z);
      node.connections.forEach((connId) => {
        const target = nodes.find((n) => n.id === connId);
        if (target) {
          pts.push(start, new THREE.Vector3(target.x, target.y, target.z));
        }
      });
    });
    return pts;
  }, [nodes]);

  const isWire = renderMode === 'wireframe';
  const isPoints = renderMode === 'point-cloud';

  return (
    <group ref={groupRef}>
      {/* Node Geometries */}
      {nodes.map((node) => {
        const isHovered = hoveredNode === node.id;
        const isSelected = selectedNodeId === node.id;
        
        // Unique geometry shapes instead of spheres: alternated between octahedrons and tetrahedrons
        const nodeTypeIdx = parseInt(node.id.replace(/\D/g, '') || '0') % 2;

        return (
          <group key={node.id} position={[node.x, node.y, node.z]}>
            {isPoints ? (
              <points
                onPointerOver={(e) => { e.stopPropagation(); setHoveredNode(node.id); }}
                onPointerOut={() => setHoveredNode(null)}
                onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); onNodeClick(node.id); }}
              >
                <octahedronGeometry args={[isHovered ? 0.2 : 0.14, 0]} />
                <pointsMaterial color={isHovered ? '#ffffff' : nodeColor} size={0.06} sizeAttenuation />
              </points>
            ) : (
              <mesh
                onPointerOver={(e) => { e.stopPropagation(); setHoveredNode(node.id); }}
                onPointerOut={() => setHoveredNode(null)}
                onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); onNodeClick(node.id); }}
              >
                {nodeTypeIdx === 0 ? (
                  <octahedronGeometry args={[isHovered || isSelected ? 0.18 : 0.13, 0]} />
                ) : (
                  <tetrahedronGeometry args={[isHovered || isSelected ? 0.18 : 0.13, 0]} />
                )}
                <meshStandardMaterial
                  color={isHovered ? '#ffffff' : nodeColor}
                  wireframe={isWire}
                  emissive={isHovered ? '#ffffff' : nodeColor}
                  emissiveIntensity={isSelected ? 0.8 : 0.3}
                  roughness={0.2}
                  metalness={0.8}
                />
              </mesh>
            )}

            {/* Orbiting Ring for Selected/Hovered node */}
            {(isHovered || isSelected) && !isPoints && (
              <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                <torusGeometry args={[0.26, 0.015, 6, 24]} />
                <meshBasicMaterial color={isHovered ? '#ffffff' : nodeColor} transparent opacity={0.6} wireframe={isWire} />
              </mesh>
            )}

            {/* Hover Tooltip Overlay */}
            {isHovered && (
              <Html distanceFactor={6}>
                <div className="bg-[#0B1015]/95 border border-stable/40 text-[#F2FBFA] text-[9px] p-2 rounded shadow-lg font-mono whitespace-nowrap glow-border-stable z-30">
                  <div className="font-bold text-stable uppercase">{node.id}</div>
                  <div>Sync Ratio: {Math.round(85 + Math.sin(node.x * 10) * 10)}%</div>
                  <div>Sync State: ACTIVE</div>
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Network Edges */}
      {linePoints.length > 0 && !isPoints && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                Float32Array.from(linePoints.flatMap((p) => [p.x, p.y, p.z])),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={nodeColor} opacity={isWire ? 0.7 : 0.3} transparent />
        </lineSegments>
      )}
    </group>
  );
}

function useMemoColor(status: HostStatus) {
  return useMemo(() => {
    if (status === 'stable') return '#45D9C4';
    if (status === 'watch') return '#B58BFF';
    if (status === 'critical') return '#FF5C5C';
    return '#B58BFF';
  }, [status]);
}

export default function GenomeMap3D({ nodes, status, onNodeClick }: GenomeMap3DProps) {
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0);
  const [renderMode, setRenderMode] = useState<"hologram" | "wireframe" | "point-cloud">("hologram");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNodeDetails = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = nodes.find(n => n.id === selectedNodeId);
    if (!node) return null;
    
    // Procedural sci-fi data based on node coordinates
    const syncRatio = Math.round(85 + Math.sin(node.x * 10) * 10);
    const pulseFactor = (Math.cos(node.y * 5) * 0.4).toFixed(3);
    const synapticDrift = Math.abs(Math.sin(node.z * 15) * 15).toFixed(1);

    return {
      id: node.id,
      syncRatio,
      pulseFactor,
      synapticDrift,
      connections: node.connections.join(', ')
    };
  }, [selectedNodeId, nodes]);

  return (
    <div className="w-full h-full relative flex flex-col justify-between" style={{ minHeight: '300px' }}>
      
      {/* 3D Map Viewport */}
      <div className="flex-1 relative w-full h-[400px]">
        <div className="absolute top-2 left-2 z-10 font-mono text-[9px] text-[#F2FBFA]/70 bg-[#050911]/80 p-2 rounded border border-stable/20 backdrop-blur">
          NEUROGRAFT GENOMIC GRAPH SYSTEM <br />
          SELECT NODES FOR DEEP TELEMETRY
        </div>

        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <GenomeGraph 
            nodes={nodes} 
            status={status} 
            onNodeClick={onNodeClick} 
            rotationSpeed={rotationSpeed}
            renderMode={renderMode}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
          />
          <OrbitControls enableZoom={true} enablePan={false} />
        </Canvas>

        {/* Selected Node Details Box (Pinned Overlay) */}
        {selectedNodeDetails && (
          <div className="absolute top-2 right-2 z-10 w-52 bg-[#0A1020]/95 border border-stable/40 p-3 rounded shadow-lg font-mono text-[9px] text-[#F2FBFA]">
            <div className="flex items-center justify-between border-b border-stable/20 pb-1 mb-2">
              <span className="font-bold text-stable text-glow-stable uppercase">{selectedNodeDetails.id} DIAGNOSTICS</span>
              <button onClick={() => setSelectedNodeId(null)} className="text-gray-400 hover:text-white">×</button>
            </div>
            <div className="space-y-1.5 leading-normal">
              <div className="flex justify-between">
                <span className="text-gray-400">Sync Ratio:</span>
                <span className="text-stable font-bold">{selectedNodeDetails.syncRatio}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pulse Factor:</span>
                <span>{selectedNodeDetails.pulseFactor} Hz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ablation Drift:</span>
                <span className={parseFloat(selectedNodeDetails.synapticDrift) > 10 ? 'text-critical' : 'text-stable'}>
                  {selectedNodeDetails.synapticDrift}%
                </span>
              </div>
              <div className="border-t border-stable/10 pt-1 mt-1 text-[8px] text-gray-400">
                <div>Connections:</div>
                <div className="text-white truncate">{selectedNodeDetails.connections || 'None'}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Speed and Render Mode Controls */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 bg-[#0A1020]/60 border-t border-stable/10 p-3 mt-1 rounded-b-lg">
        <div className="flex items-center gap-2 font-mono text-[9px] text-readout/70 w-full md:w-auto">
          <span>ROTATION SPEED: {rotationSpeed.toFixed(1)}x</span>
          <input 
            type="range" 
            min="0" 
            max="2.5" 
            step="0.1" 
            value={rotationSpeed} 
            onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
            className="w-24 h-1 bg-stable/20 rounded-lg appearance-none cursor-pointer accent-stable"
          />
        </div>
        <div className="flex gap-1.5 w-full md:w-auto">
          {(["hologram", "wireframe", "point-cloud"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setRenderMode(mode)}
              className={`px-3 py-1 rounded font-mono text-[8px] uppercase tracking-wider border transition-all ${
                renderMode === mode 
                  ? 'bg-stable/20 border-stable text-stable text-glow-stable font-bold'
                  : 'bg-transparent border-stable/10 text-readout/40 hover:text-readout/70'
              }`}
            >
              {mode.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
