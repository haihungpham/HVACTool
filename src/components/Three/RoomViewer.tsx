'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useProjectStore, Scenario, Diffuser, Point3D } from '@/store/useProjectStore';
import { HeatmapShader } from './HeatmapShader';
import { AirflowParticles } from './AirflowParticles';
import { Activity, Box } from 'lucide-react';

/* ── Auto-fit camera to scene ────────────────────────────────── */
function AutoFit({ length, width, height }: { length: number; width: number; height: number }) {
    const { camera } = useThree();

    useEffect(() => {
        // Calculate the diagonal of the room to determine optimal distance
        const diagonal = Math.sqrt(length * length + width * width + height * height);
        const distance = diagonal * 1.4; // 1.4x the diagonal gives a nice framing

        camera.position.set(distance * 0.6, distance * 0.5, distance * 0.6);
        (camera as THREE.PerspectiveCamera).fov = 45;
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
        camera.lookAt(0, height / 2, 0);
    }, [camera, length, width, height]);

    return null;
}

/* ── Room Mesh ───────────────────────────────────────────────── */
const RoomMesh = ({ scenario }: { scenario: Scenario }) => {
    const { length, width, height } = scenario.geometry;
    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[length, width]} />
                <meshStandardMaterial color="#f0f0f0" />
            </mesh>

            {/* Ceiling – semi-transparent */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
                <planeGeometry args={[length, width]} />
                <meshStandardMaterial color="#e5e7eb" transparent opacity={0.08} side={THREE.DoubleSide} />
            </mesh>

            {/* Walls — wireframe for visibility */}
            <lineSegments position={[0, height / 2, 0]}>
                <edgesGeometry args={[new THREE.BoxGeometry(length, height, width)]} />
                <lineBasicMaterial color="#cbd5e1" transparent opacity={0.35} />
            </lineSegments>

            {/* Solid floor edge outline for grounding */}
            <lineSegments rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
                <edgesGeometry args={[new THREE.PlaneGeometry(length, width)]} />
                <lineBasicMaterial color="#94a3b8" />
            </lineSegments>
        </group>
    );
};

/* ── Window Marker ───────────────────────────────────────────── */
const WindowMarker = ({ window: w, scenario }: { window: any; scenario: Scenario }) => {
    const { length, width } = scenario.geometry;
    return (
        <mesh position={[w.position.x - length / 2, w.position.y, w.position.z - width / 2]}>
            <boxGeometry args={[0.05, w.size.h, w.size.w]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.5} emissive="#0ea5e9" emissiveIntensity={0.8} />
        </mesh>
    );
};

/* ── Heatmap Plane ───────────────────────────────────────────── */
const HeatmapPlane = ({ scenario }: { scenario: Scenario }) => {
    const { length, width } = scenario.geometry;
    const visualizationMode = useProjectStore((s) => s.visualizationMode);

    const dataTexture = useMemo(() => {
        if (!scenario.result) return null;
        const grid = visualizationMode === 'velocity'
            ? scenario.result.velocityGrid
            : visualizationMode === 'co2'
                ? scenario.result.co2Grid
                : scenario.result.temperatureGrid;
        const size = grid.length;
        const data = new Float32Array(size * size);
        for (let i = 0; i < size; i++)
            for (let j = 0; j < size; j++)
                data[j * size + i] = grid[i][j];
        const tex = new THREE.DataTexture(data, size, size, THREE.RedFormat, THREE.FloatType);
        tex.needsUpdate = true;
        return tex;
    }, [scenario.result, visualizationMode]);

    if (!dataTexture || !scenario.result) return null;

    const modeInt = visualizationMode === 'temperature' ? 0 : visualizationMode === 'velocity' ? 1 : 2;
    const minVal = modeInt === 0 ? scenario.result.kpis.minTemp : modeInt === 1 ? 0.0 : 400;
    const maxVal = modeInt === 0 ? scenario.result.kpis.maxTemp : modeInt === 1 ? 1.5 : 1000;

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry args={[length, width]} />
            <shaderMaterial
                vertexShader={HeatmapShader.vertexShader}
                fragmentShader={HeatmapShader.fragmentShader}
                uniforms={{
                    ...HeatmapShader.uniforms,
                    uData: { value: dataTexture },
                    uMinVal: { value: minVal },
                    uMaxVal: { value: maxVal },
                    uMode: { value: modeInt },
                }}
                transparent
            />
        </mesh>
    );
};

/* ── Diffuser Marker ─────────────────────────────────────────── */
const DiffuserMarker = ({ diffuser, scenario }: { diffuser: Diffuser; scenario: Scenario }) => {
    const { length, width } = scenario.geometry;
    return (
        <mesh position={[diffuser.position.x - length / 2, diffuser.position.y, diffuser.position.z - width / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.08, 32]} />
            <meshStandardMaterial color={diffuser.type === 'ceiling' ? '#0ea5e9' : '#3b82f6'} emissive="#0ea5e9" emissiveIntensity={0.3} />
        </mesh>
    );
};

/* ── Hotspot Marker ──────────────────────────────────────────── */
const HotspotMarker = ({ position, type, length, width }: { position: Point3D; type: 'max' | 'min'; length: number; width: number }) => (
    <group position={[position.x - length / 2, position.y + 0.05, position.z - width / 2]}>
        <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
                color={type === 'max' ? '#ef4444' : '#3b82f6'}
                emissive={type === 'max' ? '#ef4444' : '#3b82f6'}
                emissiveIntensity={2}
            />
        </mesh>
    </group>
);

/* ── Main RoomViewer ─────────────────────────────────────────── */
export const RoomViewer = ({ scenarioId }: { scenarioId?: string }) => {
    const { scenarios, activeScenarioId, showParticles, visualizationMode } = useProjectStore();
    const targetId = scenarioId || activeScenarioId;
    const activeScenario = scenarios.find((s) => s.id === targetId);
    const controlsRef = useRef<any>(null);

    useEffect(() => {
        const handleReset = () => {
            if (controlsRef.current) {
                controlsRef.current.reset();
            }
        };
        const handleExport = () => {
            const canvases = document.querySelectorAll('canvas');
            const canvas = canvases[0]; // grab the first canvas
            if (canvas) {
                const link = document.createElement('a');
                link.download = `HVAC_Snapshot_${activeScenario?.name || 'View'}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        };
        window.addEventListener('reset-camera', handleReset);
        window.addEventListener('export-snapshot', handleExport);
        return () => {
            window.removeEventListener('reset-camera', handleReset);
            window.removeEventListener('export-snapshot', handleExport);
        };
    }, [activeScenario?.name]);

    if (!activeScenario) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-[#fcfcfc] gap-4">
                <Activity className="w-10 h-10 text-[#ddd] animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#bbb]">Loading Environment</span>
            </div>
        );
    }

    const { length, width, height } = activeScenario.geometry;

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas
                shadows
                gl={{ preserveDrawingBuffer: true, antialias: true }}
                dpr={[1, 2]}
                style={{ width: '100%', height: '100%', display: 'block' }}
            >
                {/* Camera auto-fits based on room dimensions */}
                <AutoFit length={length} width={width} height={height} />
                <OrbitControls
                    ref={controlsRef}
                    makeDefault
                    target={[0, height / 2, 0]}
                    dampingFactor={0.08}
                    minDistance={1}
                    maxDistance={20}
                />

                <Environment preset="city" />
                <ambientLight intensity={0.8} />
                <directionalLight position={[8, 12, 8]} intensity={1.0} castShadow />

                {/* Scene – all objects centered at origin */}
                <group>
                    <RoomMesh scenario={activeScenario} />
                    <HeatmapPlane scenario={activeScenario} />
                    {showParticles && <AirflowParticles scenario={activeScenario} />}

                    {visualizationMode === 'temperature' && activeScenario.result?.hotspots && (
                        <>
                            <HotspotMarker position={activeScenario.result.hotspots.max} type="max" length={length} width={width} />
                            <HotspotMarker position={activeScenario.result.hotspots.min} type="min" length={length} width={width} />
                        </>
                    )}

                    {activeScenario.geometry.diffusers.map((d) => (
                        <DiffuserMarker key={d.id} diffuser={d} scenario={activeScenario} />
                    ))}
                    {activeScenario.geometry.windows.map((w) => (
                        <WindowMarker key={w.id} window={w} scenario={activeScenario} />
                    ))}
                </group>

                <Grid
                    infiniteGrid
                    fadeDistance={25}
                    sectionSize={1.0}
                    cellSize={0.5}
                    sectionColor="#dde3ea"
                    cellColor="#eef2f6"
                    sectionThickness={1}
                />
            </Canvas>

            {/* Dimension badge */}
            <div className="absolute bottom-6 left-6 flex items-center gap-3 z-10 pointer-events-none">
                <div className="px-4 py-2 bg-white/90 backdrop-blur-xl border border-[#eee] rounded-xl flex items-center gap-2.5 shadow-md">
                    <Box className="w-4 h-4 text-[#0070f3]" />
                    <span className="text-[12px] font-bold text-[#111] tracking-tight">
                        {length}m × {width}m × {height}m
                    </span>
                </div>
            </div>

            {/* Modified badge */}
            {activeScenario.isCustomized && (
                <div className="absolute top-6 right-6 bg-[#fffbeb] border border-[#fef3c7] text-[#92400e] px-4 py-2 rounded-xl text-[12px] font-bold shadow-lg z-20 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#f59e0b] animate-pulse" />
                    DESIGN MODIFIED
                </div>
            )}
        </div>
    );
};
