# NEXUS 3D Visualizer Implementation Details

This document outlines the technical details and customization steps taken to enhance the 3D visualization capabilities of the NEXUS Neurograft clinical console.

---

## 🎨 3D Shape Designs & Enhancements

### 1. 3D Neurograft Visuals (`src/components/Neurograft3D.tsx`)
Rather than using static meshes, each Neurograft class features unique procedurally animated components:
* **Coral-Vascular:** Draws cylinder-based branching limbs with floating white spheres simulating cellular blood flow.
* **Mycelial-Neural:** Draws a dense fiber network coupled with a secondary inner rotating wireframe octahedron.
* **Crystalline-Reflex:** Utilizes an icosahedron base model accompanied by two outer intersecting satellite torus rings.
* **Vine-Cognitive:** Renders tube-based Catmull-Rom curves wrapped in glowing flower buds.

### 2. 3D Genome Node Map (`src/components/GenomeMap3D.tsx`)
* **Node Geometries:** Replaced simple sphere shapes with high-tech octahedrons and tetrahedrons.
* **Pulsing Selection Rings:** Selected or hovered nodes render a local wireframe torus ring orbiting them.
* **Dynamic Connection Lines:** Connection edges are animated with a glowing wireframe layout using custom opacity.

### 3. 3D Interior Neuro-Corridor Scan (`src/components/InteriorView3D.tsx`)
* **Custom Scanning Scaffold:** Renders an abstract cybernetic brain-stem scan composed of a translucent double-sided grid cylinder, a central rotating torus-knot core, and stacked scanning rings.
* **Stylized Gene-Dots:** Floating markers now contain spinning outer satellite rings that scale and pulse to notify operators of warning or critical status.

---

## 🎛️ Interactive Controls & Overlays

To facilitate detailed visual examinations, each canvas container features a floating overlay interface built on top of the React Three Fiber viewport:
1. **Rotation Speed Modifier:** An HTML range slider tied to React state that directly scales the rotation coefficient applied inside `useFrame` animations (from `0x` for freeze-frame analysis to `2.5x` speed).
2. **Render Mode Toggle:** Switches the materials and mesh properties dynamically between:
   * **Hologram:** Custom-tinted standard material with high emissive intensity.
   * **Wireframe:** Displays the underlying polygonal layout outlines.
   * **Point Cloud:** Renders only vertices using a custom particle size and attenuation factor.
3. **Deep Telemetry Node Inspection:** Clicking a node (such as Hotspots in Neurograft or Nodes in Genome Map) mounts an absolute-positioned HTML container displaying procedurally generated medical readings (sync ratio, pulse rate, ablation drift).
