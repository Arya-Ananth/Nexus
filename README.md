# NEXUS // Neurograft Integration Registry

NEXUS is a clinical telemetry console designed for monitoring active Neurograft host integrations. Built with a retro-futuristic cyberpunk aesthetic, the console provides clinical diagnostics, 3D bio-sync telemetry, and real-time intervention controls.

![NEXUS HUD Viewport](https://raw.githubusercontent.com/Arya-Ananth/Nexus/main/public/nexus-screenshot.png) *(Placeholder or screenshot path)*

## 🚀 Tech Stack

* **Framework:** React 19 + Vite
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4 (with custom `@theme` configuration)
* **3D Rendering:** React Three Fiber (R3F) & `@react-three/drei` (Three.js)
* **State Management:** Zustand
* **Animations:** Framer Motion (for page-glitch exits and layout entries)
* **Icons:** Lucide React

---

## 🛠️ Key Features

* **Biometric Telemetry Dashboard:** Monitor real-time heart rate, neural synchronization, and compliance pressures across multiple active host subjects.
* **3D Visualizer Overlays & Controls:** Fully interactive 3D models of Neurografts with rotation speed sliders (0x - 2.5x) and render mode switches (`Hologram`, `Wireframe`, `Point Cloud`).
* **Active Hotspot Telemetry:** Orbiting glowing nodes on the 3D Neurograft models show interactive diagnostics on click.
* **3D Genome Node Web Map:** Custom octahedron and tetrahedron node network showing dynamic link segments, rotating select rings, and a persistent pinned diagnostic overlay.
* **3D Interior Neuro-Corridor Scan:** Custom cybernetic corridor wireframe comprising stacked scanning rings, a grid cylinder, and an inner rotating torus core to guide ablation interventions.
* **Quick Intervention Panel:** Perform medical-grade actions including host sedation, ethical log freezes, clinical gamble recalibrations, and extraction requests.

---

## 💻 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Arya-Ananth/Nexus.git
cd Nexus
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```

---

## 🔬 Implementation Highlights

For a deep-dive breakdown of the custom R3F geometric rendering, custom telemetry systems, and shape overhauls completed in this project, refer to [IMPLEMENTATION.md](file:///c:/Users/anunt/OneDrive/Desktop/files/nexus/IMPLEMENTATION.md).
