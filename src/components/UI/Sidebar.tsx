'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store/useProjectStore';
import {
    Layers, Mountain, Pencil, Copy,
    ChevronRight, ChevronDown, Plus, Filter, MoreHorizontal,
    Box, Wind, Globe, Maximize2, Settings
} from 'lucide-react';

/* ── Forma Left Panel ────────────────────────────────────────── */
/* Matches: thin icon strip (40px) + content panel (200px)       */
/* Top: "Proposals" with scenario cards                          */
/* Bottom: "Layers" with tree hierarchy                          */

const LAYERS = [
    { id: 'room', label: 'Room', icon: Maximize2, children: [] },
    { id: 'diffuser', label: 'Diffusers', icon: Wind, children: ['Ceiling Diffuser 1'] },
    { id: 'duct', label: 'Ductwork', icon: Layers, children: [] },
    { id: 'boundary', label: 'Boundaries', icon: Globe, children: ['Window 1'] },
];

type SidePanel = 'proposals' | 'layers' | 'settings';

export const Sidebar = () => {
    const { scenarios, activeScenarioId, setActiveScenario, addScenario } = useProjectStore();
    const activeScenario = scenarios.find(s => s.id === activeScenarioId);
    const [activePanel, setActivePanel] = useState<SidePanel>('proposals');
    const [expandedLayer, setExpandedLayer] = useState<string | null>('diffuser');

    return (
        <aside className="flex h-full shrink-0">
            {/* Icon Strip — Forma style: very thin, light gray bg */}
            <div className="w-10 h-full bg-[#f2f2f2] border-r border-[#e8e8e8] flex flex-col items-center pt-2 gap-0.5">
                {([
                    { id: 'proposals' as const, icon: Copy, tip: 'Proposals' },
                    { id: 'layers' as const, icon: Layers, tip: 'Layers' },
                    { id: 'settings' as const, icon: Settings, tip: 'Settings' },
                ]).map(({ id, icon: Icon, tip }) => (
                    <button
                        key={id}
                        title={tip}
                        onClick={() => setActivePanel(id)}
                        className={cn(
                            "w-8 h-8 flex items-center justify-center rounded transition-colors",
                            activePanel === id
                                ? "bg-white text-[#0696d7] shadow-sm"
                                : "text-[#888] hover:bg-[#e8e8e8] hover:text-[#555]"
                        )}
                    >
                        <Icon className="w-[18px] h-[18px]" />
                    </button>
                ))}

                {/* Bottom icons — like Forma's bottom icon strip */}
                <div className="flex-1" />
                <button className="w-8 h-8 flex items-center justify-center rounded text-[#888] hover:bg-[#e8e8e8] mb-2" title="Help">
                    <Mountain className="w-[18px] h-[18px]" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded text-[#888] hover:bg-[#e8e8e8] mb-3" title="Settings">
                    <Settings className="w-[18px] h-[18px]" />
                </button>
            </div>

            {/* Content Panel */}
            <div className="w-[200px] h-full bg-white border-r border-[#e8e8e8] flex flex-col overflow-hidden">
                {activePanel === 'proposals' && (
                    <>
                        {/* Header row — matches Forma's "Proposals" header */}
                        <div className="flex items-center justify-between px-3 pt-3 pb-2">
                            <span className="text-[13px] font-semibold text-[#333]">Proposals</span>
                            <div className="flex items-center gap-0.5">
                                <button className="forma-icon-btn !w-6 !h-6" title="Filter"><Filter className="w-3.5 h-3.5" /></button>
                                <button className="forma-icon-btn !w-6 !h-6" title="Settings"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                                <button
                                    onClick={() => addScenario(`Scenario ${scenarios.length + 1}`)}
                                    className="forma-icon-btn !w-6 !h-6" title="Add"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        <div className="px-2 text-[11px] text-[#999] mb-1 ml-1">Last edited</div>

                        {/* Scenario cards — like Forma's proposal cards */}
                        <div className="px-2 space-y-1">
                            {scenarios.map(s => {
                                const isActive = s.id === activeScenarioId;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => setActiveScenario(s.id)}
                                        className={cn(
                                            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-left transition-colors",
                                            isActive
                                                ? "bg-[#e8f4fd] border border-[#b8dff5]"
                                                : "hover:bg-[#f5f5f5] border border-transparent"
                                        )}
                                    >
                                        {/* Thumbnail */}
                                        <div className={cn(
                                            "w-9 h-9 rounded flex items-center justify-center shrink-0 text-[10px] font-bold",
                                            isActive ? "bg-[#0696d7] text-white" : "bg-[#f0f0f0] text-[#aaa]"
                                        )}>
                                            <Box className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className={cn(
                                                "text-[12px] truncate",
                                                isActive ? "font-semibold text-[#333]" : "text-[#555]"
                                            )}>{s.name}</span>
                                            <span className="text-[10px] text-[#999]">
                                                {s.result ? 'Simulated' : 'Draft'}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Layers section below proposals — like Forma */}
                        <div className="mt-4 border-t border-[#f0f0f0] flex-1 flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between px-3 pt-3 pb-1">
                                <span className="text-[13px] font-semibold text-[#333]">Layers</span>
                            </div>
                            <div className="px-3 py-1">
                                <div className="flex items-center gap-1.5 text-[11px] text-[#999]">
                                    <Mountain className="w-3 h-3" />
                                    <span>Terrain</span>
                                </div>
                                <p className="text-[11px] text-[#bbb] mt-1.5 ml-5 leading-relaxed">
                                    Elements unique to this proposal will be listed here.
                                </p>
                            </div>

                            {/* Layer tree */}
                            <div className="flex-1 overflow-y-auto thin-scrollbar">
                                <div className="px-2 py-1 flex items-center gap-1.5 text-[12px] text-[#333] bg-[#fafafa] border-y border-[#f0f0f0]">
                                    <Box className="w-3.5 h-3.5 text-[#0696d7]" />
                                    <span className="font-medium">{activeScenario?.name || 'Base'}</span>
                                    <div className="flex-1" />
                                    <button className="forma-icon-btn !w-5 !h-5"><MoreHorizontal className="w-3 h-3" /></button>
                                    <button className="forma-icon-btn !w-5 !h-5"><Pencil className="w-3 h-3" /></button>
                                </div>

                                {LAYERS.map(layer => (
                                    <div key={layer.id}>
                                        <button
                                            onClick={() => setExpandedLayer(expandedLayer === layer.id ? null : layer.id)}
                                            className={cn(
                                                "w-full flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-left transition-colors",
                                                expandedLayer === layer.id
                                                    ? "bg-[#e8f4fd] text-[#0696d7] font-medium"
                                                    : "text-[#555] hover:bg-[#f5f5f5]"
                                            )}
                                        >
                                            <layer.icon className="w-3.5 h-3.5 shrink-0" />
                                            <span className="flex-1">{layer.label}</span>
                                            {layer.children.length > 0 && (
                                                expandedLayer === layer.id
                                                    ? <ChevronDown className="w-3 h-3 text-[#999]" />
                                                    : <ChevronRight className="w-3 h-3 text-[#999]" />
                                            )}
                                        </button>
                                        {expandedLayer === layer.id && layer.children.map((child, i) => (
                                            <div key={i} className="pl-8 pr-3 py-1 text-[11px] text-[#767676] hover:bg-[#f5f5f5] cursor-pointer">
                                                {child}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {activePanel === 'layers' && (
                    <div className="p-3">
                        <span className="text-[13px] font-semibold text-[#333]">Layers</span>
                        <p className="text-[11px] text-[#999] mt-2">All project layers are shown here.</p>
                    </div>
                )}

                {activePanel === 'settings' && (
                    <div className="p-3">
                        <span className="text-[13px] font-semibold text-[#333]">Settings</span>
                        <p className="text-[11px] text-[#999] mt-2">Project configuration.</p>
                    </div>
                )}
            </div>
        </aside>
    );
};
