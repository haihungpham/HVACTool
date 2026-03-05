import { Scenario, SimulationResult } from '@/store/useProjectStore';

export const runSimulation = (scenario: Scenario): SimulationResult => {
    const { length, width, height, diffusers, windows } = scenario.geometry;
    const { supplyTemp, airflowRate, outdoorTemp, occupancy } = scenario.boundaryParams;

    const GRID_SIZE = 20;
    const tempGrid: number[][] = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
    const velocityGrid: number[][] = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
    const co2Grid: number[][] = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));

    // Base ambient temperature (weighted between supply and outdoor)
    const baseTemp = supplyTemp * 0.7 + 24 * 0.3;

    let maxT = -Infinity;
    let minT = Infinity;
    let maxPos = { x: 0, y: 0.1, z: 0 };
    let minPos = { x: 0, y: 0.1, z: 0 };

    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const x = (i / (GRID_SIZE - 1)) * length;
            const z = (j / (GRID_SIZE - 1)) * width;

            let localTemp = baseTemp;
            let localVelocity = 0.05 + Math.random() * 0.02; // Small background movement

            // Effect of diffusers
            diffusers.forEach((d) => {
                const dx = x - d.position.x;
                const dz = z - d.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);

                // Temperature effect (cool air spreads)
                const tempInfluence = Math.exp(-dist / 1.5);
                localTemp = localTemp * (1 - tempInfluence) + supplyTemp * tempInfluence;

                // Velocity effect (highest near diffuser)
                const velInfluence = Math.exp(-dist / 1.0) * (airflowRate / 1000);
                localVelocity += velInfluence;
            });

            // Effect of windows (heat gain/loss)
            windows.forEach((w) => {
                const dx = x - w.position.x;
                const dz = z - w.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);

                const windowInfluence = Math.exp(-dist / 2.0);
                localTemp = localTemp * (1 - windowInfluence) + outdoorTemp * 0.8 * windowInfluence;
            });

            // Add occupancy heat
            localTemp += (occupancy * 0.2);

            const finalTemp = Math.max(10, Math.min(45, localTemp));
            tempGrid[i][j] = finalTemp;
            velocityGrid[i][j] = Math.max(0, Math.min(2.0, localVelocity));

            // CO2 Grid (Ambient 400 + local stagnation effect)
            // Highly stagnant areas (low velocity) accumulate more CO2 if occupancy is high
            const localVentilationStrength = Math.max(0.1, localVelocity);
            const localCO2 = 400 + (occupancy * 200) / localVentilationStrength;
            co2Grid[i][j] = Math.max(400, Math.min(2000, localCO2));

            if (finalTemp > maxT) {
                maxT = finalTemp;
                maxPos = { x, y: 0.1, z };
            }
            if (finalTemp < minT) {
                minT = finalTemp;
                minPos = { x, y: 0.1, z };
            }
        }
    }

    // Calculate KPIs
    const allTemps = tempGrid.flat();
    const avgTemp = allTemps.reduce((a, b) => a + b, 0) / allTemps.length;

    // Comfort Score (simplified: 100 is ideal at 22-24°C)
    const tempDeviation = Math.abs(avgTemp - 23);
    const comfortScore = Math.max(0, 100 - tempDeviation * 15 - (occupancy > 5 ? 10 : 0));

    // PMV Approximation (Simplified ASHRAE 55)
    const pmv = (avgTemp - 23) / 3;

    // US-SIM-01: Realistic CO2 Proxy (Ambient 400 + Occupancy impact - Ventilation impact)
    const co2Proxy = 400 + (occupancy * 150) * (1000 / Math.max(100, airflowRate));

    return {
        temperatureGrid: tempGrid,
        velocityGrid: velocityGrid,
        co2Grid: co2Grid,
        kpis: {
            avgTemp: parseFloat(avgTemp.toFixed(1)),
            maxTemp: parseFloat(maxT.toFixed(1)),
            minTemp: parseFloat(minT.toFixed(1)),
            comfortScore: Math.round(Math.min(100, comfortScore)),
            pmv: parseFloat(pmv.toFixed(2)),
            co2Proxy: Math.round(co2Proxy),
        },
        hotspots: {
            max: maxPos,
            min: minPos,
        }
    };
};
