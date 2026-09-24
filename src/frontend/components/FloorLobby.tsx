import React from 'react';
import { ArrowUp, ArrowDown, Building2 } from 'lucide-react';
import { HallCallState, TOTAL_FLOORS } from '@shared';

interface FloorLobbyProps {
  hallCalls: HallCallState[];
  onHallCall: (floor: number, direction: 'UP' | 'DOWN') => void;
}

export const FloorLobby: React.FC<FloorLobbyProps> = ({ hallCalls, onHallCall }) => {
  const floors = Array.from({ length: TOTAL_FLOORS }, (_, i) => TOTAL_FLOORS - i);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-rose-500" />
          <h2 className="text-sm font-bold tracking-wide uppercase text-slate-200">
            Building Lobby Call Panel
          </h2>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
          Hall Calls
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
        <span>External corridor call panel:</span>
        <span className="text-amber-400/90 font-mono text-[10px]">● Re-click button to cancel</span>
      </div>

      {/* Vertical list of 10 floors (10 down to 1) */}
      <div className="flex-1 flex flex-col justify-between gap-1.5">
        {floors.map((floor) => {
          const callState = hallCalls.find((h) => h.floor === floor);
          const isUpActive = callState?.upActive ?? false;
          const isDownActive = callState?.downActive ?? false;
          const isAnyActive = isUpActive || isDownActive;

          return (
            <div
              key={floor}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                isAnyActive
                  ? 'border-amber-500/60 bg-amber-950/20 shadow-sm shadow-amber-950/40'
                  : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-900/70'
              }`}
            >
              {/* Floor Label */}
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs font-mono transition-colors ${
                    isAnyActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {floor}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  Floor {floor}
                </span>
              </div>

              {/* Status tag */}
              <div className="text-[11px] font-mono">
                {isAnyActive ? (
                  <span className="text-amber-400 animate-pulse font-medium">
                    Calling Car...
                  </span>
                ) : (
                  <span className="text-slate-600">Standby</span>
                )}
              </div>

              {/* Call Buttons UP / DOWN */}
              <div className="flex items-center gap-1.5">
                {floor < TOTAL_FLOORS ? (
                  <button
                    onClick={() => onHallCall(floor, 'UP')}
                    className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all ${
                      isUpActive
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/50 scale-105'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                    title={
                      isUpActive
                        ? `Floor ${floor} UP active — Click again to cancel`
                        : `Call Elevator at Floor ${floor} to go UP`
                    }
                  >
                    <ArrowUp className="w-3.5 h-3.5" /> UP
                  </button>
                ) : (
                  <div className="w-[52px]" /> // Placeholder for alignment at top floor
                )}

                {floor > 1 ? (
                  <button
                    onClick={() => onHallCall(floor, 'DOWN')}
                    className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all ${
                      isDownActive
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/50 scale-105'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                    title={
                      isDownActive
                        ? `Floor ${floor} DOWN active — Click again to cancel`
                        : `Call Elevator at Floor ${floor} to go DOWN`
                    }
                  >
                    <ArrowDown className="w-3.5 h-3.5" /> DN
                  </button>
                ) : (
                  <div className="w-[52px]" /> // Placeholder for alignment at bottom floor
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
