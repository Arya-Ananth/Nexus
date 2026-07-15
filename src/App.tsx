import { useState, useEffect } from 'react';
import { useNexusStore } from './store/nexusStore';
import Topbar from './components/Topbar';
import HostRoster from './components/HostRoster';
import IntegrityGauge from './components/IntegrityGauge';
import BioSyncGraph from './components/BioSyncGraph';
import CompliancePressure from './components/CompliancePressure';
import CognitionRadar from './components/CognitionRadar';
import IncidentFeed from './components/IncidentFeed';
import QuickActions from './components/QuickActions';
import Neurograft3D from './components/Neurograft3D';
import GenomeMap3D from './components/GenomeMap3D';
import InteriorView3D from './components/InteriorView3D';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ShieldAlert } from 'lucide-react';

// ── Easing presets ───────────────────────────────────────────
const EASE_OUT  = [0.16, 1, 0.3, 1] as const;
const EASE_IN   = [0.4, 0, 1, 1] as const;

// ── Creative transition: hero glitches out, console rises in ─
// Hero exit — fast glitch: horizontal jitter + hue-rotate + blur dissolve
const heroExit = {
  opacity: [1, 1, 0.85, 0.9, 0.4, 0],
  x:       [0, -5, 7, -3, 2, 0],
  filter: [
    'blur(0px) hue-rotate(0deg) saturate(1)',
    'blur(0px) hue-rotate(30deg) saturate(2)',
    'blur(1px) hue-rotate(-20deg) saturate(1.5)',
    'blur(2px) hue-rotate(10deg) saturate(1)',
    'blur(6px) hue-rotate(0deg) saturate(0.5)',
    'blur(12px) hue-rotate(0deg) saturate(0)',
  ],
  transition: {
    duration: 0.55,
    times: [0, 0.15, 0.3, 0.5, 0.75, 1],
    ease: EASE_IN,
  },
};

// Console enter — materialise upward, like booting from beneath
const consoleEnter = {
  initial: { opacity: 0, y: 28, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
  transition: { duration: 0.6, ease: EASE_OUT, delay: 0.05 },
};

export default function App() {
  const [inConsole, setInConsole] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'genome' | 'interior'>('console');

  const { hosts, selectedHostId, telemetryTick } = useNexusStore();
  const selectedHost = hosts.find((h) => h.id === selectedHostId) || hosts[0];

  useEffect(() => {
    const timer = setInterval(() => telemetryTick(), 1500);
    return () => clearInterval(timer);
  }, [telemetryTick]);

  const handleStartShift = () => {
    setIsGlitching(true);
    setTimeout(() => {
      setInConsole(true);
      setIsGlitching(false);
    }, 480);
  };

  return (
    <div className={`w-full h-full relative overflow-hidden bg-base select-none ${isGlitching ? 'page-glitch-active' : ''}`}>
      {/* Subtle grid + noise (no scan-line) */}
      <div className="absolute inset-0 hud-grid pointer-events-none z-[1]" />
      <div className="absolute inset-0 noise-bg pointer-events-none z-[2]" />

      <AnimatePresence mode="wait">
        {!inConsole ? (
          /* ═══════════════════ HERO ═══════════════════ */
          <motion.div
            key="hero"
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE_OUT } }}
            exit={heroExit}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6 z-10"
          >
            {/* Corner ambient labels */}
            <div className="absolute top-5 left-6 font-mono text-[9px] text-stable/35 space-y-1 leading-relaxed">
              <div>REGISTRY: SECURE</div>
              <div>LOC_ID: PX-2091</div>
            </div>
            <div className="absolute top-5 right-6 font-mono text-[9px] text-stable/35 space-y-1 text-right leading-relaxed">
              <div>FUSION RATIO: DYNAMIC</div>
              <div>AUTH: SYNTH-MEDIC</div>
            </div>

            {/* ── Title block ── */}
            <motion.div
              className="flex flex-col items-center text-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.55, ease: EASE_OUT }}
            >
              {/* Eyebrow pill */}
              <div className="flex items-center gap-2 border border-alert/30 bg-alert/8 px-4 py-1.5 rounded-full text-alert text-[10px] font-mono tracking-[0.2em] uppercase text-glow-alert">
                <ShieldAlert size={11} className="animate-pulse" />
                <span>Neurograft Integration Registry</span>
              </div>

              {/* NEXUS — Audiowide alien font with flicker + glow */}
              <h1 className="font-alien text-6xl lg:text-7xl font-normal text-readout text-glow-stable flicker uppercase tracking-[0.22em]"
                style={{ textShadow: '0 0 20px rgba(0,229,200,0.5), 0 0 60px rgba(0,229,200,0.15)' }}>
                NEXUS
              </h1>

              <p className="font-body text-sm text-readout/40 max-w-sm leading-relaxed tracking-wide font-light text-center">
                Clinical telemetry console for Dr. Ama Reyes —<br />
                monitoring all active Neurograft host integrations.
              </p>
            </motion.div>

            {/* Interactive Rotating 3D Hero Model */}
            <div className="w-full max-w-lg h-[350px] relative flex items-center justify-center cursor-grab active:cursor-grabbing">
              <div className="absolute inset-0 bg-gradient-radial from-alert/5 to-transparent pointer-events-none" />
              <Neurograft3D type="crystalline-reflex" status="watch" interactive={true} />
              <div className="absolute bottom-4 font-mono text-[8px] text-gray-500 uppercase tracking-widest pointer-events-none">
                Crystalline-Reflex Organism Motif // Drag to Orbit / Hover to Parallax
              </div>
            </div>

            {/* ── CTA ── */}
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.5, ease: EASE_OUT }}
            >
              <motion.button
                onClick={handleStartShift}
                whileHover={{ scale: 1.05, boxShadow: '0 0 32px rgba(168,85,247,0.45), 0 0 8px rgba(168,85,247,0.3)' }}
                whileTap={{ scale: 0.97 }}
                className="px-12 py-3 font-display text-xs font-bold tracking-[0.2em] uppercase text-readout bg-alert/10 border border-alert/40 rounded hover:bg-alert/20 hover:border-alert transition-colors"
              >
                Start Shift &amp; Enter Console
              </motion.button>
              <span className="font-mono text-[8px] text-readout/22 tracking-[0.18em] uppercase">
                Secure Connection // Team Kaizen
              </span>
            </motion.div>
          </motion.div>

        ) : (
          /* ═══════════════════ CONSOLE ═══════════════════ */
          <motion.div
            key="console"
            initial={consoleEnter.initial}
            animate={consoleEnter.animate}
            transition={consoleEnter.transition}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col overflow-hidden z-10"
          >
            <Topbar />

            <div className="flex-1 flex overflow-hidden">
              <HostRoster />

              <main className="flex-1 flex flex-col overflow-hidden">
                {/* Sub-header */}
                <div className="border-b border-stable/10 bg-panel/60 px-5 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-sm font-bold text-readout tracking-wider">
                        {selectedHost.id} : {selectedHost.name || 'ANONYMOUS'}
                      </h2>
                      <span className={`text-[8px] px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider ${
                        selectedHost.status === 'stable'   ? 'bg-stable/10 text-stable border border-stable/25' :
                        selectedHost.status === 'watch'    ? 'bg-gold/10 text-gold border border-gold/25' :
                        selectedHost.status === 'critical' ? 'bg-critical/10 text-critical border border-critical/30 animate-pulse' :
                        'bg-alert/10 text-alert border border-alert/30 text-glow-alert'
                      }`}>
                        {selectedHost.status}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-readout/35 uppercase mt-0.5 tracking-wider">
                      Neurograft Class: <span className="text-alert capitalize">{selectedHost.neurograftClass.replace('-', ' ')}</span>
                    </p>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1.5">
                    {(['console', 'genome', 'interior'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 rounded font-mono text-[9px] uppercase font-bold tracking-wider border transition-all ${
                          activeTab === tab
                            ? 'bg-alert/20 border-alert text-readout text-glow-alert'
                            : 'bg-transparent border-stable/10 text-readout/40 hover:text-readout/80 hover:border-stable/30'
                        }`}
                      >
                        {tab === 'console' ? 'Console' : tab === 'genome' ? '3D Genome' : '3D Interior'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <AnimatePresence mode="wait">
                    {activeTab === 'console' && (
                      <motion.div
                        key="console-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.28, ease: EASE_OUT }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      >
                        <div className="panel-card p-3 flex flex-col justify-between glow-border-alert min-h-[180px]">
                          <div className="border-b border-stable/10 pb-1.5 mb-2 font-mono text-[9px] text-readout/60 font-bold tracking-widest uppercase">
                            Integration Thermal Ratio
                          </div>
                          <IntegrityGauge percentage={selectedHost.fusionIntegrity} status={selectedHost.status} />
                        </div>

                        <div className="panel-card p-3 flex flex-col glow-border-alert min-h-[180px] lg:col-span-2">
                          <div className="border-b border-stable/10 pb-1.5 mb-2 font-mono text-[9px] text-readout/60 font-bold tracking-widest uppercase flex items-center justify-between">
                            <span>Vital Bio-Sync Oscilloscope (Live)</span>
                            <span className="text-[8px] text-stable flex items-center gap-1">
                              <Activity size={10} className="animate-pulse" />
                              Synced
                            </span>
                          </div>
                          <div className="flex-1">
                            <BioSyncGraph data={selectedHost.bioSync} />
                          </div>
                        </div>

                        <div className="min-h-[130px]">
                          <CompliancePressure value={selectedHost.compliancePressure} />
                        </div>

                        <div className="panel-card p-3 flex flex-col glow-border-alert min-h-[220px]">
                          <div className="border-b border-stable/10 pb-1.5 mb-1 font-mono text-[9px] text-readout/60 font-bold tracking-widest uppercase">
                            4-Axis Cognition Drift
                          </div>
                          <div className="flex-1">
                            <CognitionRadar drift={selectedHost.cognitionDrift} />
                          </div>
                        </div>

                        <div className="min-h-[220px]">
                          <QuickActions host={selectedHost} />
                        </div>

                        <div className="lg:col-span-3 min-h-[200px]">
                          <IncidentFeed hostId={selectedHost.id} incidents={selectedHost.incidents} />
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'genome' && (
                      <motion.div
                        key="genome-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.28, ease: EASE_OUT }}
                        className="panel-card p-4 glow-border-alert h-[500px]"
                      >
                        <GenomeMap3D
                          nodes={selectedHost.genomeNodes}
                          status={selectedHost.status}
                          onNodeClick={(id) => console.log('Node:', id)}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'interior' && (
                      <motion.div
                        key="interior-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.28, ease: EASE_OUT }}
                        className="h-[500px]"
                      >
                        <InteriorView3D type={selectedHost.neurograftClass} status={selectedHost.status} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
