'use client';

import React from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { Settings, Download, ChevronDown, HelpCircle } from 'lucide-react';
import { generatePDFReport } from '@/lib/report-generator';
import { runSimulation } from '@/lib/simulation-engine';
import { cn } from '@/lib/utils';

export const Navbar = () => {
    const {
        scenarios, activeScenarioId, comparisonScenarioId,
        workflowMode, setWorkflowMode, setSimulationResult,
        setComparisonScenario
    } = useProjectStore();

    const active = scenarios.find(s => s.id === activeScenarioId);
    const comparison = scenarios.find(s => s.id === comparisonScenarioId);
    const hasResult = !!active?.result;

    const handleModeSwitch = (mode: 'Design' | 'Analyze' | 'Compare') => {
        setWorkflowMode(mode);
        if (mode === 'Compare' && !comparisonScenarioId) {
            const firstOther = scenarios.find(s => s.id !== activeScenarioId);
            if (firstOther) setComparisonScenario(firstOther.id);
        }
    };

    const handleExport = async () => {
        if (active?.result) {
            const canvasNodes = Array.from(document.querySelectorAll('canvas'));
            const imageA = canvasNodes[0]?.toDataURL('image/png');
            const imageB = canvasNodes[1]?.toDataURL('image/png');
            await generatePDFReport(active, (workflowMode === 'Compare' && comparison) ? comparison : undefined, imageA, imageB);
        }
    };

    return (
        <header className="h-10 bg-white border-b border-[#e8e8e8] flex items-center px-3 z-30 shrink-0">
            {/* Logo — Forma style: icon + product name + dropdown */}
            <div className="flex items-center gap-2 mr-3">
                <div className="w-6 h-6 bg-[#0696d7] rounded flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <span className="text-[13px] font-semibold text-[#0696d7]">HVAC</span>
                <span className="text-[13px] text-[#333]">{workflowMode === 'Design' ? 'Room design' : workflowMode === 'Analyze' ? 'Analysis' : 'Comparison'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#999]" />
            </div>

            {/* Center — Location / Project info (like Forma's location bar) */}
            <div className="flex-1 flex justify-center">
                <span className="text-[12px] text-[#767676]">
                    {active?.name || 'Untitled Project'} — {active?.geometry.length}×{active?.geometry.width}×{active?.geometry.height}m
                </span>
            </div>

            {/* Right — minimal actions */}
            <div className="flex items-center gap-1">
                <button
                    onClick={handleExport}
                    disabled={!hasResult}
                    className={cn(
                        "forma-icon-btn",
                        !hasResult && "opacity-30 cursor-not-allowed"
                    )}
                    title="Export Report"
                >
                    <Download className="w-4 h-4" />
                </button>
                <button className="forma-icon-btn" title="Settings">
                    <Settings className="w-4 h-4" />
                </button>
                <button className="forma-icon-btn" title="Help">
                    <HelpCircle className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
};
