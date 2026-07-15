import { create } from 'zustand';
import { generateMockHosts } from '../utils/mockData';
import type { Host, BioSyncPoint, Incident } from '../utils/mockData';

interface NexusState {
  hosts: Host[];
  selectedHostId: string;
  shiftStatus: "ACTIVE" | "PAUSED";
  alertCount: number;
  recalibratingHostId: string | null; // For animation feedback of recalibrate action
  recalibrateResult: "stabilized" | "partial" | "collapsed" | null;
  
  // Actions
  selectHost: (id: string) => void;
  toggleShiftStatus: () => void;
  resolveIncident: (hostId: string, incidentId: string) => void;
  sedateHost: (hostId: string) => void;
  extractHost: (hostId: string) => void;
  flagHost: (hostId: string) => void;
  recalibrateHost: (hostId: string) => void;
  clearRecalibrateState: () => void;
  telemetryTick: () => void;
}

export const useNexusStore = create<NexusState>((set, get) => ({
  hosts: generateMockHosts(),
  selectedHostId: "HOST-07", // Kael Ito as primary
  shiftStatus: "ACTIVE",
  alertCount: 4,
  recalibratingHostId: null,
  recalibrateResult: null,

  selectHost: (id) => set({ selectedHostId: id }),
  
  toggleShiftStatus: () => set((state) => ({ 
    shiftStatus: state.shiftStatus === "ACTIVE" ? "PAUSED" : "ACTIVE" 
  })),

  resolveIncident: (hostId, incidentId) => set((state) => ({
    hosts: state.hosts.map((h) => {
      if (h.id !== hostId) return h;
      return {
        ...h,
        incidents: h.incidents.map((inc) => 
          inc.id === incidentId ? { ...inc, resolved: true } : inc
        )
      };
    })
  })),

  sedateHost: (hostId) => {
    set((state) => ({
      hosts: state.hosts.map((h) => {
        if (h.id !== hostId) return h;
        // Append sedate incident
        const newIncident: Incident = {
          id: `inc-sed-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          label: "Chemical Sedation Infused",
          resolved: true,
          detail: "Neurograft neural transmission suppressed via local sedative. Bio-sync flattening."
        };
        return {
          ...h,
          fusionIntegrity: Math.min(h.fusionIntegrity + 10, 95),
          status: h.status === "critical" ? "watch" : h.status,
          compliancePressure: Math.min(h.compliancePressure + 25, 100),
          incidents: [newIncident, ...h.incidents],
          // Flatten current bioSync immediately for responsiveness
          bioSync: h.bioSync.map((pt, idx) => {
            if (idx >= h.bioSync.length - 3) {
              return { ...pt, heartRate: 55, neuralSync: 95 };
            }
            return pt;
          })
        };
      })
    }));
  },

  extractHost: (hostId) => {
    set((state) => ({
      hosts: state.hosts.map((h) => {
        if (h.id !== hostId) return h;
        const newIncident: Incident = {
          id: `inc-ext-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          label: "Extraction Scheduled",
          resolved: true,
          detail: "Compliance extraction team scheduled. Neurograft suppression field initialized."
        };
        return {
          ...h,
          isPendingExtraction: true,
          status: "stable", // Settle down
          fusionIntegrity: 100, // Safe mode
          compliancePressure: 100, // No pressure anymore
          incidents: [newIncident, ...h.incidents]
        };
      })
    }));
  },

  flagHost: (hostId) => {
    set((state) => ({
      hosts: state.hosts.map((h) => {
        if (h.id !== hostId) return h;
        const newIncident: Incident = {
          id: `inc-flag-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          label: "Case Flagged for Panel Review",
          resolved: false,
          detail: "Manual diagnostic override. System logs frozen for ethical medical review."
        };
        return {
          ...h,
          incidents: [newIncident, ...h.incidents]
        };
      })
    }));
  },

  recalibrateHost: (hostId) => {
    set({ recalibratingHostId: hostId, recalibrateResult: null });

    // Recalibrate is a gamble! Resolve after 2.5 seconds
    setTimeout(() => {
      const state = get();
      const currentHost = state.hosts.find(h => h.id === hostId);
      if (!currentHost) return;

      const outcomes: ("stabilized" | "partial" | "collapsed")[] = ["stabilized", "partial", "collapsed"];
      const result = outcomes[Math.floor(Math.random() * outcomes.length)];

      set((state) => ({
        recalibrateResult: result,
        hosts: state.hosts.map((h) => {
          if (h.id !== hostId) return h;

          let newStatus = h.status;
          let newIntegrity = h.fusionIntegrity;
          let newPressure = h.compliancePressure;
          let incidentLabel = "";
          let incidentDetail = "";

          if (result === "stabilized") {
            newStatus = "stable";
            newIntegrity = 95;
            newPressure = 100;
            incidentLabel = "Recalibration Succeeded";
            incidentDetail = "Neural drift fully aligned. The Neurograft has successfully integrated into a stable state.";
          } else if (result === "partial") {
            newStatus = "watch";
            newIntegrity = 75;
            newPressure = 80;
            incidentLabel = "Partial Recalibration";
            incidentDetail = "Synaptic sync achieved partially. Organism remains in watch status under close observation.";
          } else {
            newStatus = "critical";
            newIntegrity = 30;
            newPressure = 15;
            incidentLabel = "Recalibration Failed: Neural Collapse";
            incidentDetail = "Severe feedback loop. Neurograft integrity collapsed. Imminent extraction required.";
          }

          const newIncident: Incident = {
            id: `inc-recal-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
            label: incidentLabel,
            resolved: result !== "collapsed",
            detail: incidentDetail
          };

          return {
            ...h,
            status: newStatus,
            fusionIntegrity: newIntegrity,
            compliancePressure: newPressure,
            incidents: [newIncident, ...h.incidents]
          };
        })
      }));
    }, 2500);
  },

  clearRecalibrateState: () => set({ recalibratingHostId: null, recalibrateResult: null }),

  telemetryTick: () => {
    if (get().shiftStatus !== "ACTIVE") return;

    set((state) => {
      const now = Date.now();
      let alerts = 0;

      const updatedHosts = state.hosts.map((h) => {
        // Don't update hosts pending extraction
        if (h.isPendingExtraction) return h;

        // 1. Bio Sync updates
        let targetHR = 75;
        let targetSync = 80;

        // Customize behavior based on scenarios
        if (h.id === "HOST-19") {
          // False alarm: spikes heart rate but keeps sync high
          targetHR = 150 + Math.sin(now / 5000) * 10;
          targetSync = 92 + Math.cos(now / 8000) * 2;
        } else if (h.status === "critical") {
          targetHR = 95 + Math.sin(now / 2000) * 15;
          targetSync = 45 + Math.cos(now / 3000) * 10;
        } else if (h.status === "emergence") {
          targetHR = 60 + Math.sin(now / 6000) * 5;
          targetSync = 85 + Math.sin(now / 4000) * 10; // Pulsing sync
        } else if (h.status === "watch") {
          targetHR = 85 + Math.sin(now / 4000) * 10;
          targetSync = 70 + Math.cos(now / 5000) * 8;
        } else {
          // Stable
          targetHR = 70 + Math.sin(now / 8000) * 6;
          targetSync = 88 + Math.cos(now / 10000) * 4;
        }

        const newPt: BioSyncPoint = {
          timestamp: now,
          heartRate: Math.max(40, Math.min(200, Math.round(targetHR))),
          neuralSync: Math.max(10, Math.min(100, Math.round(targetSync))),
        };

        const newBioSync = [...h.bioSync.slice(1), newPt];

        // 2. Quiet drift scenario updates (HOST-12)
        let newIntegrity = h.fusionIntegrity;
        let newDrift = { ...h.cognitionDrift };
        let newStatus = h.status;

        if (h.id === "HOST-12") {
          // Slowly increase drift, decay integrity
          newDrift.current = {
            memory: Math.min(100, h.cognitionDrift.current.memory + 0.3),
            mood: Math.min(100, h.cognitionDrift.current.mood + 0.2),
            impulseControl: Math.min(100, h.cognitionDrift.current.impulseControl + 0.4),
            identityContinuity: Math.max(0, h.cognitionDrift.current.identityContinuity + 0.2)
          };
          newIntegrity = Math.max(30, h.fusionIntegrity - 0.2);
          if (newIntegrity < 50) {
            newStatus = "critical";
          } else if (newIntegrity < 75) {
            newStatus = "watch";
          }
        }

        // 3. Compliance pressure timer ticks down
        let newPressure = h.compliancePressure;
        if (h.status === "critical") {
          newPressure = Math.max(0, h.compliancePressure - 1.2);
        } else if (h.status === "emergence") {
          newPressure = Math.max(0, h.compliancePressure - 0.6); // Compliance pushes on emergence
        } else if (h.status === "watch") {
          newPressure = Math.max(0, h.compliancePressure - 0.3);
        } else {
          newPressure = Math.min(100, h.compliancePressure + 0.2); // slowly recovers
        }

        // Auto trigger alerts count
        if (h.status === "critical" || h.status === "emergence" || h.status === "watch") {
          const unresolved = h.incidents.some(i => !i.resolved);
          if (unresolved) alerts++;
        }

        return {
          ...h,
          bioSync: newBioSync,
          fusionIntegrity: Math.round(newIntegrity * 10) / 10,
          cognitionDrift: newDrift,
          compliancePressure: Math.round(newPressure * 10) / 10,
          status: newStatus
        };
      });

      return {
        hosts: updatedHosts,
        alertCount: alerts
      };
    });
  }
}));
