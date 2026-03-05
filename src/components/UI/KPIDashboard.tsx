'use client';

import React, { useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/lib/utils';
import {
    BarChart3, Sun, Wind, Cloud, Users, Settings2, Pencil,
    Thermometer, Activity, Zap, ChevronRight, HelpCircle
} from 'lucide-react';
import { runSimulation } from '@/lib/simulation-engine';

/* ── Forma Right Panel ───────────────────────────────────────── */
/* Matches: "Analyze" header + icon row + sections + Run CTA     */
/* Width: ~260px, clean form layout with label : value rows      */

type Tab = 'analyze' | 'geometry' | 'boundary';

function FormRow({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex items-center justify-between py-1.5", className)}>
            <span className="text-[12px] text-[#555]">{label}</span>
            {children}
        </div>
    );
}

function SliderRow({ label, value, unit, onChange, min, max, step }: {
    label: string; value: number; unit: string;
    onChange: (v: number) => void; min: number; max: number; step: number;
}) {
    const pct = ((value - min) / (max - min)) * 100;
    return (
        <div className="py-2">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-[#555]">{label}</span>
                <span className="text-[12px] text-[#333] font-medium">{value} {unit}</span>
            </div>
            <div className="slider-wrap h-4">
                <div className="slider-track">
                    <div className="slider-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="slider-thumb" style={{ left: `${pct}%` }} />
                <input
                    type="range" min={min} max={max} step={step} value={value}
                    onChange={e => onChange(Number(e.target.value))}
                    className="slider-raw h-4"
                />
            </div>
        </div>
    );
}

export const KPIDashboard = () => {
    const {
        scenarios, activeScenarioId, workflowMode,
        updateGeometry, updateBoundaryParams, setSimulationResult,
        setWorkflowMode, setComparisonScenario, comparisonScenarioId
    } = useProjectStore();
    const s = scenarios.find(x => x.id === activeScenarioId);
    if (!s) return null;

    const handleRun = () => setSimulationResult(s.id, runSimulation(s));
    const kpis = s.result?.kpis;

    const handleModeSwitch = (mode: 'Design' | 'Analyze' | 'Compare') => {
        setWorkflowMode(mode);
        if (mode === 'Compare' && !comparisonScenarioId) {
            const other = scenarios.find(sc => sc.id !== activeScenarioId);
            if (other) setComparisonScenario(other.id);
        }
    };

    // Forma-style icon tabs at top of right panel
    const TABS: { id: 'Design' | 'Analyze' | 'Compare'; icon: any; label: string }[] = [
        { id: 'Design', icon: Pencil, label: 'Design' },
        { id: 'Analyze', icon: BarChart3, label: 'Analyze' },
        { id: 'Compare', icon: Activity, label: 'Compare' },
    ];

    const ANALYSIS_TABS: { icon: any; label: string }[] = [
        { icon: Thermometer, label: 'Thermal' },
        { icon: Sun, label: 'Solar' },
        { icon: Wind, label: 'Wind' },
        { icon: Cloud, label: 'Air Quality' },
        { icon: Users, label: 'Comfort' },
        { icon: Settings2, label: 'Advanced' },
    ];

    return (
        <aside className="w-[260px] h-full bg-white border-l border-[#e8e8e8] flex flex-col overflow-hidden shrink-0">
            {/* Panel Header — "Analyze" like Forma */}
            <div className="px-4 pt-3 pb-1">
                <span className="text-[14px] font-semibold text-[#333]">
                    {workflowMode === 'Design' ? 'Design' : workflowMode === 'Analyze' ? 'Analyze' : 'Compare'}
                </span>
            </div>

            {/* Mode icon row — matches Forma's icon tabs */}
            <div className="px-3 py-2 flex items-center gap-0.5 border-b border-[#f0f0f0]">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => handleModeSwitch(t.id)}
                        title={t.label}
                        className={cn(
                            "forma-icon-btn",
                            workflowMode === t.id && "active"
                        )}
                    >
                        <t.icon className="w-[18px] h-[18px]" />
                    </button>
                ))}

                <div className="w-px h-5 bg-[#e8e8e8] mx-1" />

                {/* Analysis sub-tabs — like Forma's second row of icons */}
                {ANALYSIS_TABS.slice(0, 4).map((t, i) => (
                    <button key={i} className="forma-icon-btn" title={t.label}>
                        <t.icon className="w-[18px] h-[18px]" />
                    </button>
                ))}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto thin-scrollbar">

                {/* Section: Microclimate / Thermal — like Forma */}
                <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center gap-1">
                        <span className="text-[13px] font-semibold text-[#333]">Thermal Comfort</span>
                        <HelpCircle className="w-3.5 h-3.5 text-[#ccc]" />
                    </div>
                </div>

                {/* Room dimensions — clean form like Forma's Road section */}
                <div className="px-4 py-2 border-b border-[#f0f0f0]">
                    <FormRow label="Room length">
                        <div className="flex items-center gap-1">
                            <span className="text-[11px] text-[#999]">W</span>
                            <input
                                type="number" value={s.geometry.length} min={2} max={10} step={0.1}
                                onChange={e => updateGeometry(s.id, { length: Number(e.target.value) })}
                                className="forma-input w-14 text-[12px]"
                            />
                        </div>
                    </FormRow>
                    <FormRow label="Room width">
                        <input
                            type="number" value={s.geometry.width} min={2} max={10} step={0.1}
                            onChange={e => updateGeometry(s.id, { width: Number(e.target.value) })}
                            className="forma-input w-14 text-[12px]"
                        />
                    </FormRow>
                    <FormRow label="Room height">
                        <input
                            type="number" value={s.geometry.height} min={2} max={4} step={0.1}
                            onChange={e => updateGeometry(s.id, { height: Number(e.target.value) })}
                            className="forma-input w-14 text-[12px]"
                        />
                    </FormRow>
                </div>

                {/* Slider: Supply Temp — like Forma's "Microclimate area radius" slider */}
                <div className="px-4 py-2 border-b border-[#f0f0f0]">
                    <SliderRow label="Supply temperature" value={s.boundaryParams.supplyTemp} unit="°C"
                        onChange={v => updateBoundaryParams(s.id, { supplyTemp: v })} min={14} max={32} step={0.5} />
                </div>

                {/* Run Analysis CTA — Forma's green button */}
                <div className="px-4 py-3">
                    <button
                        onClick={handleRun}
                        className="w-full h-9 bg-[#1ea87b] hover:bg-[#178f69] text-white text-[13px] font-semibold rounded transition-colors"
                    >
                        Run analysis
                    </button>
                </div>

                {/* Results section — like Forma's "Open last analysis" */}
                {kpis ? (
                    <div className="px-4 border-t border-[#f0f0f0]">
                        <button className="w-full flex items-center justify-between py-2.5 text-[12px] text-[#333] hover:text-[#0696d7]">
                            <span className="font-medium">Open last analysis</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#999]" />
                        </button>
                        <a className="text-[12px] text-[#0696d7] hover:underline cursor-pointer">View history</a>
                    </div>
                ) : null}

                {/* Boundary params — like Forma's "Road" section with edit card */}
                <div className="border-t border-[#f0f0f0] mt-2">
                    <div className="px-4 pt-3 pb-1 flex items-center gap-1">
                        <span className="text-[13px] font-semibold text-[#333]">Airflow</span>
                        <span className="text-[12px] text-[#0696d7] ml-1">{s.geometry.diffusers.length}</span>
                    </div>

                    {/* Editable card — like Forma's "Edit base to make changes" */}
                    {!s.result && (
                        <div className="mx-4 mt-2 mb-3 border border-[#e8e8e8] rounded-lg p-4 flex flex-col items-center gap-2">
                            <Pencil className="w-5 h-5 text-[#ccc]" />
                            <span className="text-[11px] text-[#999] text-center">Edit parameters to configure airflow</span>
                        </div>
                    )}

                    <div className="px-4 py-1">
                        <FormRow label="Airflow rate">
                            <div className="flex items-center gap-1">
                                <input
                                    type="number" value={s.boundaryParams.airflowRate} min={100} max={2500} step={50}
                                    onChange={e => updateBoundaryParams(s.id, { airflowRate: Number(e.target.value) })}
                                    className="forma-input w-16 text-[12px]"
                                />
                                <span className="text-[11px] text-[#999]">m³/h</span>
                            </div>
                        </FormRow>
                    </div>

                    {/* Occupancy — like Forma's "Daily traffic distribution" */}
                    <div className="px-4 pt-2 pb-1">
                        <span className="text-[11px] text-[#999]">Occupancy profile</span>
                    </div>
                    <div className="px-4 pb-3">
                        <FormRow label="Occupants">
                            <div className="flex items-center gap-1">
                                <input
                                    type="number" value={s.boundaryParams.occupancy} min={0} max={20} step={1}
                                    onChange={e => updateBoundaryParams(s.id, { occupancy: Number(e.target.value) })}
                                    className="forma-input w-14 text-[12px]"
                                />
                                <span className="text-[11px] text-[#999]">pers</span>
                            </div>
                        </FormRow>
                        <FormRow label="Outdoor temp">
                            <div className="flex items-center gap-1">
                                <input
                                    type="number" value={s.boundaryParams.outdoorTemp} min={15} max={45} step={1}
                                    onChange={e => updateBoundaryParams(s.id, { outdoorTemp: Number(e.target.value) })}
                                    className="forma-input w-14 text-[12px]"
                                />
                                <span className="text-[11px] text-[#999]">°C</span>
                            </div>
                        </FormRow>
                    </div>
                </div>

                {/* Results metrics — clean compact display */}
                {kpis && (
                    <div className="border-t border-[#f0f0f0]">
                        <div className="px-4 pt-3 pb-1">
                            <span className="text-[11px] text-[#999] uppercase tracking-wide font-medium">Analysis Results</span>
                        </div>
                        <div className="px-4 pb-4 space-y-1.5">
                            <FormRow label="Avg temperature">
                                <span className="text-[12px] font-medium text-[#333]">{kpis.avgTemp.toFixed(1)} °C</span>
                            </FormRow>
                            <FormRow label="Max temperature">
                                <span className="text-[12px] font-medium text-[#333]">{kpis.maxTemp.toFixed(1)} °C</span>
                            </FormRow>
                            <FormRow label="Comfort score">
                                <span className="text-[12px] font-medium text-[#1ea87b]">{Math.round(kpis.comfortScore)}%</span>
                            </FormRow>
                            <FormRow label="PMV index">
                                <span className="text-[12px] font-medium text-[#333]">{kpis.pmv.toFixed(2)}</span>
                            </FormRow>
                            <FormRow label="CO₂ level">
                                <span className="text-[12px] font-medium text-[#333]">{Math.round(kpis.co2Proxy)} ppm</span>
                            </FormRow>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};
