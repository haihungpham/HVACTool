'use client';

import React from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { Thermometer, Activity, CloudRain, Zap, BarChart3, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const METRICS = [
    { key: 'avgTemp', label: 'Avg Temp', unit: '°C', icon: Thermometer, color: '#f97316', bg: '#fff7ed', fmt: (v: number) => v.toFixed(1) },
    { key: 'comfortScore', label: 'Comfort Score', unit: '%', icon: Activity, color: '#22c55e', bg: '#f0fdf4', fmt: (v: number) => Math.round(v).toString() },
    { key: 'co2Proxy', label: 'CO₂ Estimate', unit: 'ppm', icon: CloudRain, color: '#0ea5e9', bg: '#f0f9ff', fmt: (v: number) => Math.round(v).toString() },
    { key: 'pmv', label: 'ASHRAE PMV', unit: '', icon: Zap, color: '#a855f7', bg: '#faf5ff', fmt: (v: number) => v.toFixed(2) },
] as const;

export const ResultsPanel = () => {
    const { scenarios, activeScenarioId } = useProjectStore();
    const activeScenario = scenarios.find(s => s.id === activeScenarioId);
    const kpis = activeScenario?.result?.kpis;

    return (
        <div className="h-full bg-white border-t border-[#d0d7de] flex flex-col overflow-hidden">
            {/* Sub-header */}
            <div className="h-8 px-3 border-b border-[#d0d7de] bg-[#f6f8fa] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-[#0969da]" />
                    <span className="text-[11px] font-semibold text-[#24292f] uppercase tracking-tight">
                        Comfort Analysis & Performance Metrics
                    </span>
                </div>
                {kpis && (
                    <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2da44e]" />
                        <span className="text-[10px] font-semibold text-[#2da44e] uppercase">AI Verified</span>
                    </div>
                )}
            </div>

            {/* Metric cards */}
            {kpis ? (
                <div className="flex-1 flex overflow-hidden">
                    {METRICS.map(({ key, label, unit, icon: Icon, color, bg, fmt }) => (
                        <div
                            key={key}
                            className="flex-1 flex items-center gap-3 px-5 border-r border-[#eaeef2] last:border-0 hover:bg-[#f6f8fa] transition-colors"
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
                                <Icon className="w-4 h-4" style={{ color }} />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-[#57606a] uppercase tracking-wider leading-none mb-1">{label}</p>
                                <div className="flex items-baseline gap-1 leading-none">
                                    <span className="text-[22px] font-mono font-bold text-[#24292f] tabular-nums leading-none">
                                        {fmt(kpis[key])}
                                    </span>
                                    {unit && <span className="text-[12px] font-medium text-[#57606a]">{unit}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center gap-2.5 text-[#8c959f]">
                    <Info className="w-4 h-4 opacity-60" />
                    <span className="text-[12px]">
                        Run a prediction to view comfort analysis
                    </span>
                </div>
            )}
        </div>
    );
};
