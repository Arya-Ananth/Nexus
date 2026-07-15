export type NeurograftClass =
  | "coral-vascular"
  | "mycelial-neural"
  | "crystalline-reflex"
  | "vine-cognitive";

export type HostStatus = "stable" | "watch" | "critical" | "emergence";

export interface BioSyncPoint {
  timestamp: number;
  heartRate: number;
  neuralSync: number;
}

export interface CognitionDrift {
  current: { memory: number; mood: number; impulseControl: number; identityContinuity: number };
  threeDaysAgo: { memory: number; mood: number; impulseControl: number; identityContinuity: number };
}

export interface Incident {
  id: string;
  timestamp: string;
  label: string;
  resolved: boolean;
  detail?: string;
}

export interface GenomeNode {
  id: string;
  x: number;
  y: number;
  z: number;
  connections: string[];
}

export interface Host {
  id: string;
  name: string;
  neurograftClass: NeurograftClass;
  status: HostStatus;
  fusionIntegrity: number; // 0-100
  bioSync: BioSyncPoint[];
  cognitionDrift: CognitionDrift;
  compliancePressure: number; // 0-100, counts down (so 100 means no pressure, 0 means compliance intervenes)
  incidents: Incident[];
  genomeNodes: GenomeNode[];
  isPendingExtraction?: boolean;
}

export function generateGenomeNodes(neurograftClass: NeurograftClass): GenomeNode[] {
  const nodes: GenomeNode[] = [];
  const numNodes = 25;
  
  if (neurograftClass === 'crystalline-reflex') {
    // Generate a lattice (sharp angles)
    for (let i = 0; i < numNodes; i++) {
      const theta = (i / numNodes) * Math.PI * 2;
      const phi = Math.acos(2 * (i / numNodes) - 1);
      const r = 2 + (i % 3) * 0.4;
      nodes.push({
        id: `node-${i}`,
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        connections: []
      });
    }
    // Connect to neighbors
    for (let i = 0; i < numNodes; i++) {
      const connections: string[] = [];
      for (let j = i + 1; j < numNodes; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 2.0 && connections.length < 3) {
          connections.push(nodes[j].id);
        }
      }
      nodes[i].connections = connections;
    }
  } else if (neurograftClass === 'coral-vascular') {
    // Branching structure
    nodes.push({ id: 'root', x: 0, y: -2, z: 0, connections: [] });
    for (let i = 1; i < numNodes; i++) {
      const parentIdx = Math.min(i - 1, Math.floor(Math.sqrt(Math.random() * i * i)));
      const parent = nodes[parentIdx];
      const angle = Math.random() * Math.PI * 2;
      const length = 0.6 + Math.random() * 0.6;
      const node = {
        id: `node-${i}`,
        x: parent.x + Math.sin(angle) * length * 0.6,
        y: parent.y + length * 0.8,
        z: parent.z + Math.cos(angle) * length * 0.6,
        connections: []
      };
      nodes.push(node);
      parent.connections.push(node.id);
    }
  } else if (neurograftClass === 'mycelial-neural') {
    // Dense web
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        id: `node-${i}`,
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 4,
        connections: []
      });
    }
    for (let i = 0; i < numNodes; i++) {
      const connections: string[] = [];
      for (let j = 0; j < numNodes; j++) {
        if (i === j) continue;
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 2.2 && connections.length < 3) {
          connections.push(nodes[j].id);
        }
      }
      nodes[i].connections = connections;
    }
  } else {
    // Vine-Cognitive: curling spiral
    for (let i = 0; i < numNodes; i++) {
      const t = i / numNodes;
      const angle = t * Math.PI * 6;
      const r = 1.2 + t * 1.0;
      nodes.push({
        id: `node-${i}`,
        x: r * Math.cos(angle),
        y: t * 5 - 2.5,
        z: r * Math.sin(angle),
        connections: i > 0 ? [`node-${i-1}`] : []
      });
    }
  }
  return nodes;
}

function generateBioSyncHistory(): BioSyncPoint[] {
  const points: BioSyncPoint[] = [];
  const now = Date.now();
  for (let i = 15; i >= 0; i--) {
    points.push({
      timestamp: now - i * 3000,
      heartRate: 65 + Math.floor(Math.random() * 20),
      neuralSync: 75 + Math.floor(Math.random() * 20),
    });
  }
  return points;
}

export function generateMockHosts(): Host[] {
  const hosts: Host[] = [
    // 1. Crystalline-Reflex (Kael Ito) - Primary Demo Host
    {
      id: "HOST-07",
      name: "Kael Ito",
      neurograftClass: "crystalline-reflex",
      status: "watch",
      fusionIntegrity: 78,
      bioSync: generateBioSyncHistory(),
      cognitionDrift: {
        current: { memory: 42, mood: 65, impulseControl: 70, identityContinuity: 58 },
        threeDaysAgo: { memory: 20, mood: 35, impulseControl: 45, identityContinuity: 30 }
      },
      compliancePressure: 72,
      incidents: [
        { id: "inc-1", timestamp: "18:15:30", label: "Neural Response Lag", resolved: false, detail: "0.45s delay in reflex loop. Exceeds courier tolerance thresholds." },
        { id: "inc-2", timestamp: "16:22:11", label: "Prismatic Lattice Expansion", resolved: true, detail: "Faceted growth detected in motor cortex. Stabilized after local cooling." }
      ],
      genomeNodes: generateGenomeNodes("crystalline-reflex")
    },
    // 2. Mycelial-Neural - Scripted Emergence Host (Starts transitioning)
    {
      id: "HOST-03",
      name: "Aria Vance",
      neurograftClass: "mycelial-neural",
      status: "emergence",
      fusionIntegrity: 92,
      bioSync: generateBioSyncHistory(),
      cognitionDrift: {
        current: { memory: 88, mood: 79, impulseControl: 85, identityContinuity: 15 },
        threeDaysAgo: { memory: 45, mood: 48, impulseControl: 50, identityContinuity: 70 }
      },
      compliancePressure: 45,
      incidents: [
        { id: "inc-3", timestamp: "17:40:02", label: "Non-Human Abstraction Loop", resolved: false, detail: "Host communicating in multi-threaded binary bursts. Organism reading no drift, but identity continuity crashed to 15%." },
        { id: "inc-4", timestamp: "12:10:00", label: "Mycelial Pulse Coordination", resolved: true, detail: "Sync signal firing in complete harmony across both hemispheres." }
      ],
      genomeNodes: generateGenomeNodes("mycelial-neural")
    },
    // 3. Coral-Vascular - Scripted False Alarm (High HR, stable sync)
    {
      id: "HOST-19",
      name: "Jana Reyes",
      neurograftClass: "coral-vascular",
      status: "stable",
      fusionIntegrity: 94,
      bioSync: generateBioSyncHistory(),
      cognitionDrift: {
        current: { memory: 12, mood: 15, impulseControl: 10, identityContinuity: 12 },
        threeDaysAgo: { memory: 10, mood: 14, impulseControl: 11, identityContinuity: 10 }
      },
      compliancePressure: 100,
      incidents: [
        { id: "inc-5", timestamp: "18:22:00", label: "Vascular Surge Detected", resolved: false, detail: "Heart rate spiked to 160bpm. Neural synchronization remains stable at 94%. Likely metabolic exercise spike." }
      ],
      genomeNodes: generateGenomeNodes("coral-vascular")
    },
    // 4. Vine-Cognitive - Scripted Quiet Drift (Integrity sinking, Drift creeping up)
    {
      id: "HOST-12",
      name: "Zane Vance",
      neurograftClass: "vine-cognitive",
      status: "watch",
      fusionIntegrity: 62,
      bioSync: generateBioSyncHistory(),
      cognitionDrift: {
        current: { memory: 55, mood: 62, impulseControl: 58, identityContinuity: 60 },
        threeDaysAgo: { memory: 30, mood: 35, impulseControl: 28, identityContinuity: 32 }
      },
      compliancePressure: 80,
      incidents: [
        { id: "inc-6", timestamp: "18:01:15", label: "Tendril Tension Increase", resolved: false, detail: "Sensory extensions in temporal lobe are tightening. Creeping drift on memory retention." }
      ],
      genomeNodes: generateGenomeNodes("vine-cognitive")
    },
    // 5. Critical Rejection Host
    {
      id: "HOST-01",
      name: "Dax Rylan",
      neurograftClass: "coral-vascular",
      status: "critical",
      fusionIntegrity: 35,
      bioSync: generateBioSyncHistory(),
      cognitionDrift: {
        current: { memory: 78, mood: 89, impulseControl: 92, identityContinuity: 85 },
        threeDaysAgo: { memory: 65, mood: 70, impulseControl: 75, identityContinuity: 78 }
      },
      compliancePressure: 22,
      incidents: [
        { id: "inc-7", timestamp: "18:20:00", label: "Vascular Rejection Crisis", resolved: false, detail: "Organism branch integrity is collapsing. High arterial pressure in neural corridor." }
      ],
      genomeNodes: generateGenomeNodes("coral-vascular")
    }
  ];

  // Fill in rest of 20 hosts with procedural stable/watch/critical profiles
  const classes: NeurograftClass[] = ["coral-vascular", "mycelial-neural", "crystalline-reflex", "vine-cognitive"];
  const names = [
    "Vesper Thorne", "Lyra Jax", "Kaelen Voss", "Soren Reed", "Rhea Novak", 
    "Corin Hale", "Talia Frost", "Orin Vane", "Sylvia Ray", "Jude Mercer",
    "Zephyr Cole", "Nesta Vance", "Linus Gray", "Mira Thorne", "Atlas Finch"
  ];

  for (let i = 0; i < 15; i++) {
    const idNum = i + 20;
    const neurograftClass = classes[i % 4];
    const status: HostStatus = Math.random() > 0.75 ? "watch" : "stable";
    const integrity = status === "watch" ? 65 + Math.floor(Math.random() * 15) : 85 + Math.floor(Math.random() * 15);
    hosts.push({
      id: `HOST-${idNum}`,
      name: names[i] || `Host Alpha-${idNum}`,
      neurograftClass,
      status,
      fusionIntegrity: integrity,
      bioSync: generateBioSyncHistory(),
      cognitionDrift: {
        current: {
          memory: Math.floor(Math.random() * 40),
          mood: Math.floor(Math.random() * 40),
          impulseControl: Math.floor(Math.random() * 40),
          identityContinuity: Math.floor(Math.random() * 40)
        },
        threeDaysAgo: {
          memory: Math.floor(Math.random() * 30),
          mood: Math.floor(Math.random() * 30),
          impulseControl: Math.floor(Math.random() * 30),
          identityContinuity: Math.floor(Math.random() * 30)
        }
      },
      compliancePressure: 80 + Math.floor(Math.random() * 20),
      incidents: [
        { id: `inc-gen-${idNum}`, timestamp: "14:00:00", label: "Periodic Calibration Check", resolved: true, detail: "Standard system telemetry returned positive sync. No action needed." }
      ],
      genomeNodes: generateGenomeNodes(neurograftClass)
    });
  }

  return hosts;
}
