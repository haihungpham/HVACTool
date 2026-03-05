import { create } from 'zustand';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Diffuser {
  id: string;
  type: 'side' | 'ceiling';
  position: Point3D;
}

export interface RoomGeometry {
  length: number;
  width: number;
  height: number;
  windows: Array<{ id: string; position: Point3D; size: { w: number; h: number } }>;
  diffusers: Diffuser[];
}

export interface SimulationResult {
  temperatureGrid: number[][]; // 20x20
  velocityGrid: number[][];    // 20x20
  co2Grid: number[][];         // 20x20
  kpis: {
    avgTemp: number;
    maxTemp: number;
    minTemp: number;
    comfortScore: number;
    pmv: number;
    co2Proxy: number;
  };
  hotspots: {
    max: Point3D;
    min: Point3D;
  };
}

export interface Scenario {
  id: string;
  name: string;
  geometry: RoomGeometry;
  boundaryParams: {
    supplyTemp: number;
    airflowRate: number;
    outdoorTemp: number;
    occupancy: number;
  };
  result: SimulationResult | null;
  isCustomized: boolean; // True if parameters changed since last simulation
}

interface ProjectState {
  scenarios: Scenario[];
  activeScenarioId: string | null;
  comparisonScenarioId: string | null;
  visualizationMode: 'temperature' | 'velocity' | 'co2';
  showParticles: boolean;
  workflowMode: 'Design' | 'Analyze' | 'Compare';

  // Actions
  addScenario: (name: string) => void;
  duplicateScenario: (id: string, newName: string) => void;
  removeScenario: (id: string) => void;
  setActiveScenario: (id: string) => void;
  setComparisonScenario: (id: string | null) => void;
  setVisualizationMode: (mode: 'temperature' | 'velocity' | 'co2') => void;
  setShowParticles: (show: boolean) => void;
  setWorkflowMode: (mode: 'Design' | 'Analyze' | 'Compare') => void;
  updateGeometry: (id: string, geometry: Partial<RoomGeometry>) => void;
  updateBoundaryParams: (id: string, params: Partial<Scenario['boundaryParams']>) => void;
  setSimulationResult: (id: string, result: SimulationResult) => void;
  updateDiffuserPosition: (scenarioId: string, diffuserId: string, position: Point3D) => void;
  updateWindow: (scenarioId: string, windowId: string, data: Partial<{ position: Point3D; size: { w: number; h: number } }>) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  scenarios: [
    {
      id: 'default',
      name: 'Base Case',
      geometry: {
        length: 5,
        width: 4,
        height: 2.8,
        windows: [{ id: 'w1', position: { x: 5, y: 1.2, z: 1.5 }, size: { w: 2, h: 1.5 } }],
        diffusers: [{ id: 'd1', type: 'ceiling', position: { x: 2.5, y: 2.8, z: 2 } }],
      },
      boundaryParams: {
        supplyTemp: 16,
        airflowRate: 500,
        outdoorTemp: 32,
        occupancy: 2,
      },
      result: null,
      isCustomized: false,
    },
  ],
  activeScenarioId: 'default',
  comparisonScenarioId: null,
  visualizationMode: 'temperature',
  showParticles: true,
  workflowMode: 'Design',

  addScenario: (name) => set((state) => {
    const newId = crypto.randomUUID();
    const newScenario: Scenario = {
      ...state.scenarios[0],
      id: newId,
      name,
      result: null,
      isCustomized: false,
    };
    return { scenarios: [...state.scenarios, newScenario], activeScenarioId: newId };
  }),

  duplicateScenario: (id, newName) => set((state) => {
    const original = state.scenarios.find((s) => s.id === id);
    if (!original) return state;
    const newId = crypto.randomUUID();
    const copy: Scenario = JSON.parse(JSON.stringify(original));
    copy.id = newId;
    copy.name = newName;
    copy.isCustomized = false;
    return { scenarios: [...state.scenarios, copy], activeScenarioId: newId };
  }),

  setActiveScenario: (id) => set({ activeScenarioId: id }),

  setComparisonScenario: (id) => set({ comparisonScenarioId: id }),

  setVisualizationMode: (mode) => set({ visualizationMode: mode }),

  setShowParticles: (show) => set({ showParticles: show }),

  setWorkflowMode: (mode) => set({ workflowMode: mode }),

  removeScenario: (id) => set((state) => {
    const filtered = state.scenarios.filter((s) => s.id !== id);
    return {
      scenarios: filtered,
      activeScenarioId: state.activeScenarioId === id ? (filtered[0]?.id || null) : state.activeScenarioId,
      comparisonScenarioId: state.comparisonScenarioId === id ? null : state.comparisonScenarioId
    };
  }),

  updateGeometry: (id, geometry) => set((state) => ({
    scenarios: state.scenarios.map((s) =>
      s.id === id ? { ...s, geometry: { ...s.geometry, ...geometry }, isCustomized: true } : s
    ),
  })),

  updateBoundaryParams: (id, params) => set((state) => ({
    scenarios: state.scenarios.map((s) => {
      if (s.id !== id) return s;

      const newParams = { ...s.boundaryParams, ...params };
      // US-RISK-01: Parameter Clamping
      if (newParams.supplyTemp !== undefined) newParams.supplyTemp = Math.max(14, Math.min(30, newParams.supplyTemp));
      if (newParams.airflowRate !== undefined) newParams.airflowRate = Math.max(100, Math.min(2000, newParams.airflowRate));
      if (newParams.occupancy !== undefined) newParams.occupancy = Math.max(0, Math.min(20, newParams.occupancy));

      return { ...s, boundaryParams: newParams, isCustomized: true };
    }),
  })),

  setSimulationResult: (id, result) => set((state) => ({
    scenarios: state.scenarios.map((s) =>
      s.id === id ? { ...s, result, isCustomized: false } : s
    ),
  })),

  updateDiffuserPosition: (scenarioId, diffuserId, position) => set((state) => ({
    scenarios: state.scenarios.map((s) =>
      s.id === scenarioId ? {
        ...s,
        geometry: {
          ...s.geometry,
          diffusers: s.geometry.diffusers.map((d) =>
            d.id === diffuserId ? { ...d, position } : d
          ),
        },
        isCustomized: true,
      } : s
    ),
  })),

  updateWindow: (scenarioId, windowId, data) => set((state) => ({
    scenarios: state.scenarios.map((s) =>
      s.id === scenarioId ? {
        ...s,
        geometry: {
          ...s.geometry,
          windows: s.geometry.windows.map((w) =>
            w.id === windowId ? { ...w, ...data, size: { ...w.size, ...data.size } } : w
          ),
        },
        isCustomized: true,
      } : s
    ),
  })),
}));
