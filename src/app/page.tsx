'use client';

import React from 'react';
import { Navbar } from '@/components/UI/Navbar';
import { Sidebar } from '@/components/UI/Sidebar';
import { KPIDashboard } from '@/components/UI/KPIDashboard';
import { RoomViewer } from '@/components/Three/RoomViewer';
import { ScenarioTabs } from '@/components/UI/ScenarioTabs';
import { ViewportToolbar } from '@/components/UI/ViewportToolbar';
import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/lib/utils';

/* ── Forma Layout ────────────────────────────────────────────── */
/* Top:    Thin navbar (h-10)                                    */
/* Left:   Icon strip (w-10) + Panel (w-200)                     */
/* Center: Tabs + 3D Viewport (fills remaining) with floating    */
/*         toolbar at top-center                                 */
/* Right:  Config panel (w-260)                                  */
/* Bottom: Viewport status bar (h-7)                             */

export default function Home() {
  const { comparisonScenarioId, workflowMode } = useProjectStore();
  const isCompare = workflowMode === 'Compare' && !!comparisonScenarioId;

  return (
    <main className="flex flex-col h-screen w-full overflow-hidden bg-[#f7f7f7] antialiased">
      <Navbar />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />

        {/* Center viewport area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <ScenarioTabs />

          {/* 3D Viewport — fills ALL remaining space */}
          <div className="flex-1 relative min-h-0 flex overflow-hidden">

            {/* Primary 3D View */}
            <div className={cn(
              "flex-1 relative",
              isCompare && "border-r border-[#e8e8e8]"
            )}>
              <div style={{ position: 'absolute', inset: 0 }}>
                <RoomViewer />
              </div>
              {isCompare && (
                <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded bg-[#333]/70 backdrop-blur text-white text-[10px] font-medium uppercase tracking-wider">
                  Baseline
                </div>
              )}
            </div>

            {/* Comparison 3D View */}
            {isCompare && (
              <div className="flex-1 relative">
                <div style={{ position: 'absolute', inset: 0 }}>
                  <RoomViewer scenarioId={comparisonScenarioId} />
                </div>
                <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded bg-[#0696d7]/80 backdrop-blur text-white text-[10px] font-medium uppercase tracking-wider">
                  Comparison
                </div>
              </div>
            )}

            {/* Floating Toolbar — Forma style: top-center of viewport */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
              <ViewportToolbar />
            </div>
          </div>

          {/* Bottom status bar — like Forma's map attribution bar */}
          <div className="h-7 bg-white border-t border-[#e8e8e8] flex items-center justify-between px-3 shrink-0">
            <div className="flex items-center gap-3 text-[10px] text-[#999]">
              <span>HVAC AI CFD Engine v2.4</span>
              <span>•</span>
              <span>ISO 7730 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Bottom-right view controls — like Forma's view buttons */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('reset-camera'))}
                className="forma-icon-btn !w-6 !h-6"
                title="Home View"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              <span className="text-[10px] text-[#999]">3D</span>
            </div>
          </div>
        </div>

        <KPIDashboard />
      </div>
    </main>
  );
}
