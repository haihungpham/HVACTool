'use client';

import React from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import {
    MousePointer2, Move3D, Layers,
    Thermometer, Wind, Cloud,
    RotateCcw, Camera, Maximize
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Forma Floating Toolbar ──────────────────────────────────── */
/* Matches: horizontal pill at top-center of viewport            */
/* Grouped icon buttons with thin dividers                       */

export const ViewportToolbar = () => {
    const {
        visualizationMode, setVisualizationMode,
        showParticles, setShowParticles
    } = useProjectStore();

    return (
        <div className="flex items-center gap-0 bg-white border border-[#e0e0e0] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] px-1 py-0.5">

            {/* Selection / Navigation tools */}
            <button className="forma-icon-btn" title="Select"><MousePointer2 className="w-4 h-4" /></button>
            <button className="forma-icon-btn" title="Navigate"><Move3D className="w-4 h-4" /></button>

            <div className="w-px h-5 bg-[#e8e8e8] mx-0.5" />

            {/* Viz mode tools — like Forma's drawing/analysis tools */}
            <button
                onClick={() => setVisualizationMode('temperature')}
                className={cn("forma-icon-btn", visualizationMode === 'temperature' && "active")}
                title="Temperature"
            >
                <Thermometer className="w-4 h-4" />
            </button>
            <button
                onClick={() => setVisualizationMode('velocity')}
                className={cn("forma-icon-btn", visualizationMode === 'velocity' && "active")}
                title="Airflow"
            >
                <Wind className="w-4 h-4" />
            </button>
            <button
                onClick={() => setVisualizationMode('co2')}
                className={cn("forma-icon-btn", visualizationMode === 'co2' && "active")}
                title="Air Quality"
            >
                <Cloud className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-[#e8e8e8] mx-0.5" />

            {/* Particle toggle */}
            <button
                onClick={() => setShowParticles(!showParticles)}
                className={cn("forma-icon-btn", showParticles && "active")}
                title="Airflow Particles"
            >
                <Layers className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-[#e8e8e8] mx-0.5" />

            {/* View controls */}
            <button onClick={() => window.dispatchEvent(new CustomEvent('reset-camera'))} className="forma-icon-btn" title="Reset View">
                <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={() => window.dispatchEvent(new CustomEvent('export-snapshot'))} className="forma-icon-btn" title="Snapshot">
                <Camera className="w-4 h-4" />
            </button>
            <button className="forma-icon-btn" title="Fullscreen">
                <Maximize className="w-4 h-4" />
            </button>
        </div>
    );
};
