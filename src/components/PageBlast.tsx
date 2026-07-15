import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PageBlastProps {
  onComplete: () => void;
}

// The particle system inside the canvas
function BlastParticles({ onComplete }: { onComplete: () => void }) {
  const pointsRef = useRef<THREE.Points>(null);
  const elapsedRef = useRef(0);
  const DURATION = 1.2;

  const { positions, velocities, colors } = useMemo(() => {
    const COUNT = 3000;
    const pos = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);

    // Color palette: teal, violet, white, critical red
    const palette = [
      new THREE.Color('#45D9C4'),
      new THREE.Color('#B58BFF'),
      new THREE.Color('#F2FBFA'),
      new THREE.Color('#FF5C5C'),
      new THREE.Color('#B58BFF'),
      new THREE.Color('#45D9C4'),
    ];

    for (let i = 0; i < COUNT; i++) {
      // Start from center with a small random offset (the "nucleus")
      const startR = Math.random() * 0.3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3]     = startR * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = startR * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = startR * Math.cos(phi);

      // Explosive outward velocity — spread across full screen depth
      const speed = 6 + Math.random() * 18;
      const spread = 0.9 + Math.random() * 0.1; // mostly outward
      const dx = Math.sin(phi) * Math.cos(theta) * spread;
      const dy = Math.sin(phi) * Math.sin(theta) * spread;
      const dz = Math.cos(phi) * (0.2 + Math.random() * 0.5);

      vel[i * 3]     = dx * speed;
      vel[i * 3 + 1] = dy * speed;
      vel[i * 3 + 2] = dz * speed;

      // Pick a random color from palette
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3]     = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return { positions: pos, velocities: vel, colors: col };
  }, []);

  useFrame((_, delta) => {
    elapsedRef.current += delta;
    const t = elapsedRef.current / DURATION;

    if (!pointsRef.current) return;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;

    if (posAttr) {
      for (let i = 0; i < posAttr.count; i++) {
        // Add velocity with slight gravity sag on y
        posAttr.setXYZ(
          i,
          posAttr.getX(i) + velocities[i * 3] * delta,
          posAttr.getY(i) + velocities[i * 3 + 1] * delta - delta * 0.5,
          posAttr.getZ(i) + velocities[i * 3 + 2] * delta,
        );
      }
      posAttr.needsUpdate = true;
    }

    // Scale size: big bang then shrink
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    if (mat) {
      mat.size = 0.12 * (1 - t * 0.6);
      mat.opacity = t < 0.3 ? 1.0 : Math.max(0, 1 - (t - 0.3) / 0.7);
    }

    // Fire complete callback once fade is done
    if (elapsedRef.current >= DURATION) {
      onComplete();
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={1.0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Ring shockwave that expands outward
function ShockwaveRing() {
  const meshRef = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (!meshRef.current) return;
    const scale = 1 + elapsed.current * 14;
    meshRef.current.scale.set(scale, scale, 1);
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    if (mat) mat.opacity = Math.max(0, 1 - elapsed.current / 0.6);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <ringGeometry args={[0.9, 1.0, 64]} />
      <meshBasicMaterial
        color="#B58BFF"
        transparent
        opacity={1}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Full-screen overlay flash
function FlashPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    if (mat) mat.opacity = Math.max(0, 0.6 - elapsed.current * 3);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0.5]}>
      <planeGeometry args={[80, 80]} />
      <meshBasicMaterial
        color="#45D9C4"
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default function PageBlast({ onComplete }: PageBlastProps) {
  return (
    <div
      className="fixed inset-0 z-[999] pointer-events-none"
      style={{ background: 'transparent' }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 90 }}
        gl={{ alpha: true, antialias: false }}
        style={{ background: 'transparent' }}
      >
        <FlashPlane />
        <ShockwaveRing />
        <BlastParticles onComplete={onComplete} />
      </Canvas>
    </div>
  );
}
