'use client';

import React from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Forma-style Scenario Tabs ───────────────────────────────── */
/* Very minimal: thin strip, no heavy styling                    */

export const ScenarioTabs = () => {
    const { scenarios, activeScenarioId, setActiveScenario, addScenario, removeScenario } = useProjectStore();

    return (
        <div className="flex items-stretch h-8 bg-white border-b border-[#e8e8e8] overflow-x-auto shrink-0 no-scrollbar">
            {scenarios.map(s => {
                const active = s.id === activeScenarioId;
                return (
                    <button
                        key={s.id}
                        onClick={() => setActiveScenario(s.id)}
                        className={cn(
                            "group relative flex items-center gap-1.5 px-3 min-w-[100px] max-w-[160px] text-[12px] border-r border-[#e8e8e8] shrink-0 transition-colors",
                            active
                                ? "bg-white text-[#333] font-medium"
                                : "bg-[#f5f5f5] text-[#888] hover:bg-[#efefef]"
                        )}
                    >
                        {active && <div className="absolute bottom-0 inset-x-0 h-[2px] bg-[#0696d7]" />}

                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            active ? "bg-[#0696d7]" : "bg-[#ccc]"
                        )} />

                        <span className="truncate flex-1 text-left">{s.name}</span>

                        {scenarios.length > 1 && (
                            <span
                                onClick={e => { e.stopPropagation(); removeScenario(s.id); }}
                                className={cn(
                                    "p-0.5 rounded transition-all",
                                    active
                                        ? "text-[#bbb] hover:text-red-400 hover:bg-red-50"
                                        : "opacity-0 group-hover:opacity-100 text-[#bbb]"
                                )}
                            >
                                <X className="w-3 h-3" />
                            </span>
                        )}
                    </button>
                );
            })}

            <button
                onClick={() => addScenario(`Scenario ${scenarios.length + 1}`)}
                title="Add Scenario"
                className="flex items-center justify-center w-8 text-[#bbb] hover:text-[#0696d7] hover:bg-[#e8f4fd] transition-colors shrink-0 border-r border-[#e8e8e8]"
            >
                <Plus className="w-3 h-3" />
            </button>
        </div>
    );
};
