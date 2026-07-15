import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Neurograft3DProps {
  type: "coral-vascular" | "mycelial-neural" | "crystalline-reflex" | "vine-cognitive";
  status: "stable" | "watch" | "critical" | "emergence";
  interactive?: boolean;
  scatter?: boolean;
  renderMode?: "hologram" | "wireframe" | "point-cloud";
  rotationSpeed?: number;
}

// Helper to determine colors based on status
export function getStatusColor(status: "stable" | "watch" | "critical" | "emergence", time: number): THREE.Color {
  if (status === 'stable') return new THREE.Color('#45D9C4'); // Teal
  if (status === 'watch') return new THREE.Color('#B58BFF'); // Violet
  if (status === 'critical') return new THREE.Color('#FF5C5C'); // Red
  
  // Emergence: Shifting dual tone
  const t = (Math.sin(time * 2) + 1) / 2; // 0 to 1
  const teal = new THREE.Color('#45D9C4');
  const violet = new THREE.Color('#B58BFF');
  return teal.clone().lerp(violet, t);
}

// 1. Enhanced Coral-Vascular: Branching structure + vascular particles
function CoralVascularModel({ color, renderMode, speed }: { color: THREE.Color; renderMode: string; speed: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const particleGroupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = elapsed * 0.15 * speed;
      groupRef.current.rotation.x = Math.sin(elapsed * 0.1) * 0.1 * speed;
    }
    if (particleGroupRef.current) {
      // Flowing particles along branches
      particleGroupRef.current.children.forEach((child, i) => {
        const offset = (elapsed * 0.4 * speed + i * 0.15) % 1.0;
        child.position.y = -1.2 + offset * 2.4;
        const scale = Math.sin(offset * Math.PI) * 0.08;
        child.scale.set(scale, scale, scale);
      });
    }
  });

  const branches = useMemo(() => {
    const list: { start: [number, number, number]; end: [number, number, number]; thickness: number }[] = [];
    const makeBranch = (start: [number, number, number], dir: [number, number, number], length: number, depth: number) => {
      if (depth > 4) return;
      const end: [number, number, number] = [
        start[0] + dir[0] * length,
        start[1] + dir[1] * length,
        start[2] + dir[2] * length
      ];
      list.push({ start, end, thickness: 0.12 / (depth + 1) });

      const subBranches = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < subBranches; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() * 0.5 + 0.2) * Math.PI;
        const subDir: [number, number, number] = [
          Math.sin(phi) * Math.cos(theta),
          Math.sin(phi) * Math.sin(theta),
          Math.cos(phi)
        ];
        makeBranch(end, subDir, length * 0.75, depth + 1);
      }
    };

    makeBranch([0, -1.2, 0], [0, 1, 0], 0.8, 0);
    return list;
  }, []);

  const isWire = renderMode === 'wireframe';
  const isPoints = renderMode === 'point-cloud';

  return (
    <group ref={groupRef}>
      {/* Dynamic central pulsing core */}
      <mesh position={[0, -0.4, 0]}>
        <dodecahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial 
          color={color} 
          wireframe={isWire}
          transparent={isPoints}
          opacity={isPoints ? 0 : 0.4}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </mesh>

      {branches.map((b, i) => {
        const pStart = new THREE.Vector3(...b.start);
        const pEnd = new THREE.Vector3(...b.end);
        const distance = pStart.distanceTo(pEnd);
        const position = pStart.clone().add(pEnd).multiplyScalar(0.5);
        
        const alignMatrix = new THREE.Matrix4().lookAt(pStart, pEnd, new THREE.Vector3(0, 1, 0));
        const rotation = new THREE.Euler().setFromRotationMatrix(
          new THREE.Matrix4().multiply(alignMatrix).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2))
        );

        if (isPoints) {
          return (
            <points key={i} position={position} rotation={rotation}>
              <cylinderGeometry args={[b.thickness * 0.7, b.thickness, distance, 4, 3]} />
              <pointsMaterial color={color} size={0.03} sizeAttenuation />
            </points>
          );
        }

        return (
          <mesh key={i} position={position} rotation={rotation}>
            <cylinderGeometry args={[b.thickness * 0.7, b.thickness, distance, 8]} />
            <meshStandardMaterial 
              color={color} 
              roughness={0.4} 
              metalness={0.2}
              emissive={color}
              emissiveIntensity={0.3}
              wireframe={isWire}
            />
          </mesh>
        );
      })}

      {/* Organic Flow Particles */}
      {!isWire && !isPoints && (
        <group ref={particleGroupRef}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[1, 8, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

// 2. Enhanced Mycelial-Neural: Pulsing electrical networks + outer particle orbit
function MycelialNeuralModel({ color, renderMode, speed }: { color: THREE.Color; renderMode: string; speed: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Points>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = elapsed * 0.2 * speed;
      groupRef.current.rotation.z = Math.sin(elapsed * 0.1) * 0.15 * speed;
    }
    if (pulseRef.current) {
      const scale = 1 + Math.sin(elapsed * 6 * speed) * 0.08;
      pulseRef.current.scale.set(scale, scale, scale);
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = -elapsed * 0.4 * speed;
      innerRef.current.rotation.y = elapsed * 0.3 * speed;
    }
  });

  const { positions, lineIndices } = useMemo(() => {
    const pos: number[] = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.9 + Math.random() * 0.7;
      pos.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }

    const lines: number[] = [];
    for (let i = 0; i < count; i++) {
      let connections = 0;
      for (let j = i + 1; j < count; j++) {
        const dx = pos[i*3] - pos[j*3];
        const dy = pos[i*3+1] - pos[j*3+1];
        const dz = pos[i*3+2] - pos[j*3+2];
        const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (d < 1.2 && connections < 4) {
          lines.push(i, j);
          connections++;
        }
      }
    }
    return { positions: Float32Array.from(pos), lineIndices: Uint16Array.from(lines) };
  }, []);

  const isWire = renderMode === 'wireframe';
  const isPoints = renderMode === 'point-cloud';

  return (
    <group ref={groupRef}>
      {/* Network Edges / Lines */}
      {!isPoints && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            <bufferAttribute attach="index" args={[lineIndices, 1]} />
          </bufferGeometry>
          <lineBasicMaterial color={color} opacity={isWire ? 0.8 : 0.45} transparent />
        </lineSegments>
      )}

      {/* Nodes / Synapses */}
      <points ref={pulseRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={color} size={isPoints ? 0.08 : 0.16} transparent sizeAttenuation />
      </points>

      {/* Core capsule inside */}
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.5, 2]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={isPoints ? 0 : 0.3} 
          wireframe={isWire}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

// 3. Enhanced Crystalline-Reflex: Faceted crystal + orbital geometry rings
function CrystallineReflexModel({ color, renderMode, speed }: { color: THREE.Color; renderMode: string; speed: number }) {
  const modelRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (modelRef.current) {
      modelRef.current.rotation.y = elapsed * 0.2 * speed;
      modelRef.current.rotation.x = elapsed * 0.1 * speed;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.x = elapsed * 0.3 * speed;
      ringRef1.current.rotation.y = elapsed * 0.15 * speed;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.y = -elapsed * 0.3 * speed;
      ringRef2.current.rotation.z = elapsed * 0.2 * speed;
    }
  });

  const isWire = renderMode === 'wireframe';
  const isPoints = renderMode === 'point-cloud';

  return (
    <group ref={modelRef}>
      {isPoints ? (
        <points>
          <icosahedronGeometry args={[1.4, 3]} />
          <pointsMaterial color={color} size={0.04} sizeAttenuation />
        </points>
      ) : (
        <>
          <mesh>
            <icosahedronGeometry args={[1.3, 1]} />
            <meshStandardMaterial 
              color={color}
              roughness={0.05}
              metalness={0.95}
              transparent
              opacity={isWire ? 0.3 : 0.8}
              emissive={color}
              emissiveIntensity={0.25}
              wireframe={isWire}
              flatShading
            />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[1.32, 1]} />
            <meshBasicMaterial color={color} wireframe transparent opacity={0.25} />
          </mesh>
        </>
      )}

      {/* Interactive Orbital Tech-Rings */}
      {!isPoints && (
        <>
          <mesh ref={ringRef1}>
            <torusGeometry args={[1.7, 0.015, 8, 48]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} wireframe={isWire} />
          </mesh>
          <mesh ref={ringRef2}>
            <torusGeometry args={[1.9, 0.01, 8, 48]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} wireframe={isWire} />
          </mesh>
        </>
      )}
    </group>
  );
}

// 4. Enhanced Vine-Cognitive: Helix-wrapped vines + bud nodes
function VineCognitiveModel({ color, renderMode, speed }: { color: THREE.Color; renderMode: string; speed: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = elapsed * 0.15 * speed;
      groupRef.current.rotation.x = Math.sin(elapsed * 0.1) * 0.1 * speed;
      
      groupRef.current.children.forEach((child, index) => {
        child.rotation.z = Math.sin(elapsed * 0.5 * speed + index) * 0.15;
      });
    }
  });

  const curves = useMemo(() => {
    const list: THREE.CatmullRomCurve3[] = [];
    const count = 4;
    for (let c = 0; c < count; c++) {
      const points: THREE.Vector3[] = [];
      const angleOffset = (c / count) * Math.PI * 2;
      
      for (let i = 0; i < 20; i++) {
        const t = i / 19;
        const angle = t * Math.PI * 3.5 + angleOffset;
        const r = 0.35 + t * 1.1;
        points.push(new THREE.Vector3(
          r * Math.cos(angle),
          t * 3.2 - 1.6,
          r * Math.sin(angle)
        ));
      }
      list.push(new THREE.CatmullRomCurve3(points));
    }
    return list;
  }, []);

  const isWire = renderMode === 'wireframe';
  const isPoints = renderMode === 'point-cloud';

  return (
    <group ref={groupRef}>
      {curves.map((curve, idx) => {
        if (isPoints) {
          return (
            <points key={idx}>
              <tubeGeometry args={[curve, 40, 0.05, 4, false]} />
              <pointsMaterial color={color} size={0.03} sizeAttenuation />
            </points>
          );
        }

        return (
          <group key={idx}>
            <mesh>
              <tubeGeometry args={[curve, 48, 0.04, 8, false]} />
              <meshStandardMaterial 
                color={color} 
                roughness={0.2}
                metalness={0.3}
                emissive={color}
                emissiveIntensity={0.25}
                wireframe={isWire}
              />
            </mesh>

            {/* Glowing synaptic flower buds along vines */}
            {!isWire && (
              <>
                <mesh position={curve.getPointAt(0.35)}>
                  <sphereGeometry args={[0.09, 8, 8]} />
                  <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={0.8} />
                </mesh>
                <mesh position={curve.getPointAt(0.7)}>
                  <sphereGeometry args={[0.09, 8, 8]} />
                  <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={0.8} />
                </mesh>
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}

// Particle Blast
function ParticleBlast({ color }: { color: THREE.Color }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const { positions, velocities } = useMemo(() => {
    const pos: number[] = [];
    const vel: number[] = [];
    const count = 800;
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.1 + Math.random() * 1.0;
      const px = r * Math.sin(phi) * Math.cos(theta);
      const py = r * Math.sin(phi) * Math.sin(theta);
      const pz = r * Math.cos(phi);
      pos.push(px, py, pz);

      const speed = 4.0 + Math.random() * 5.0;
      const dirX = px === 0 ? Math.random() - 0.5 : px;
      const dirY = py === 0 ? Math.random() - 0.5 : py;
      const dirZ = pz === 0 ? Math.random() - 0.5 : pz;
      const len = Math.sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);
      vel.push((dirX / len) * speed, (dirY / len) * speed, (dirZ / len) * speed);
    }
    return { 
      positions: Float32Array.from(pos), 
      velocities: Float32Array.from(vel) 
    };
  }, []);

  useFrame((_state, delta) => {
    if (pointsRef.current) {
      const geo = pointsRef.current.geometry;
      const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
      if (posAttr) {
        for (let i = 0; i < posAttr.count; i++) {
          const px = posAttr.getX(i) + velocities[i * 3] * delta;
          const py = posAttr.getY(i) + velocities[i * 3 + 1] * delta;
          const pz = posAttr.getZ(i) + velocities[i * 3 + 2] * delta;
          posAttr.setXYZ(i, px, py, pz);
        }
        posAttr.needsUpdate = true;
      }
      pointsRef.current.rotation.y += delta * 0.4;
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      if (mat) {
        mat.opacity = Math.max(0, mat.opacity - delta * 0.85);
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial 
        color={color} 
        size={0.06} 
        transparent 
        opacity={1.0} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Core Scene
export function NeurograftScene({ 
  type, 
  status, 
  interactive = true, 
  scatter = false,
  renderMode = 'hologram',
  rotationSpeed = 1.0,
  onNodeClick
}: Neurograft3DProps & { onNodeClick?: (id: string, detail: string) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (interactive && groupRef.current && !scatter) {
      const targetX = (state.pointer.x * 0.4);
      const targetY = (state.pointer.y * 0.4);
      groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x += (-targetY - groupRef.current.rotation.x) * 0.05;
    }
  });

  const activeColor = getStatusColor(status, 0);

  // Dynamic overlay telemetry hotspots orbiting the shape
  const hotspots = useMemo(() => [
    { id: "hot-1", pos: [1.2, 0.4, 0.4] as [number, number, number], name: "Cerebellar Synapse", detail: "Synaptic transfer speed: 8.4 GB/s. Integrity: 99.2% nominal." },
    { id: "hot-2", pos: [-0.9, -0.8, 0.8] as [number, number, number], name: "Vascular Core Node", detail: "Thermal insulation ratio: 1.15. Flow rate: 94.6% nominal." },
    { id: "hot-3", pos: [0, 1.2, -0.6] as [number, number, number], name: "Axonal Gateway", detail: "Neural drift ratio: 0.12. Compliance threshold: STABLE." }
  ], []);

  return (
    <group ref={groupRef} position={[0, 0.35, 0]}>
      {scatter ? (
        <ParticleBlast color={activeColor} />
      ) : (
        <>
          {type === 'coral-vascular' && <CoralVascularModel color={activeColor} renderMode={renderMode} speed={rotationSpeed} />}
          {type === 'mycelial-neural' && <MycelialNeuralModel color={activeColor} renderMode={renderMode} speed={rotationSpeed} />}
          {type === 'crystalline-reflex' && <CrystallineReflexModel color={activeColor} renderMode={renderMode} speed={rotationSpeed} />}
          {type === 'vine-cognitive' && <VineCognitiveModel color={activeColor} renderMode={renderMode} speed={rotationSpeed} />}

          {/* Render interactive telemetry hotspots */}
          {interactive && onNodeClick && hotspots.map((node) => (
            <mesh key={node.id} position={node.pos} onClick={(e) => { e.stopPropagation(); onNodeClick(node.name, node.detail); }}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
              <Html distanceFactor={4}>
                <button 
                  onClick={() => onNodeClick(node.name, node.detail)}
                  className="px-1.5 py-0.5 rounded bg-[#0A1020]/90 border border-stable/40 font-mono text-[7px] text-stable uppercase hover:scale-105 hover:bg-stable/20 transition-all text-glow-stable flex items-center space-x-1"
                >
                  <span className="w-1 h-1 bg-stable rounded-full animate-ping" />
                  <span>{node.name}</span>
                </button>
              </Html>
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

export default function Neurograft3D({ type, status, interactive = true, scatter = false }: Neurograft3DProps) {
  const [renderMode, setRenderMode] = useState<"hologram" | "wireframe" | "point-cloud">("hologram");
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0);
  const [activeTelemetry, setActiveTelemetry] = useState<{ title: string; text: string } | null>(null);

  return (
    <div className="w-full h-full relative flex flex-col justify-between" style={{ minHeight: '200px' }}>
      
      {/* 3D Render Canvas */}
      <div className="flex-1 w-full relative">
        <Canvas camera={{ position: [0, 0, 4.3], fov: 55 } as any}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#B58BFF" />
          <directionalLight position={[0, 5, 5]} intensity={1.2} />
          
          <NeurograftScene 
            type={type} 
            status={status} 
            interactive={interactive} 
            scatter={scatter} 
            renderMode={renderMode}
            rotationSpeed={rotationSpeed}
            onNodeClick={(title, text) => setActiveTelemetry({ title, text })}
          />
          
          {interactive && !scatter && <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />}
        </Canvas>

        {/* Floating Telemetry Box */}
        {activeTelemetry && (
          <div className="absolute top-2 right-2 z-10 w-48 bg-[#0A1020]/95 border border-alert/40 p-2 rounded shadow-lg font-mono text-[9px] text-[#F2FBFA]">
            <div className="flex items-center justify-between border-b border-alert/20 pb-1 mb-1">
              <span className="font-bold text-alert text-glow-alert uppercase">{activeTelemetry.title}</span>
              <button onClick={() => setActiveTelemetry(null)} className="text-gray-400 hover:text-white">×</button>
            </div>
            <div className="text-gray-300 leading-normal">{activeTelemetry.text}</div>
          </div>
        )}
      </div>

      {/* Control Overlay Interface */}
      {interactive && !scatter && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 bg-[#0A1020]/85 border border-stable/20 px-3 py-2 rounded-lg w-[90%] max-w-sm backdrop-blur">
          <div className="w-full flex items-center justify-between font-mono text-[8px] text-readout/60">
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
          <div className="w-full flex justify-between gap-1 mt-0.5">
            {(["hologram", "wireframe", "point-cloud"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setRenderMode(mode)}
                className={`flex-1 py-1 rounded font-mono text-[8px] uppercase tracking-wider border transition-all ${
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
      )}
    </div>
  );
}
