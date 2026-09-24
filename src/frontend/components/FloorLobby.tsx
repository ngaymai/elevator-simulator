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
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2.5">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-rose-500" />
          <h2 className="text-xs font-bold tracking-wide uppercase text-slate-200">
            Lobby Stations
          </h2>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
          Hall Calls
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 px-0.5">
        <span>Corridor Call Stations</span>
        <span className="text-amber-400/90 font-mono text-[10px]">● Re-click to cancel</span>
      </div>

      {/* Vertical list of 10 floors (10 down to 1) */}
      <div className="flex-1 flex flex-col justify-between gap-1">
        {floors.map((floor) => {
          const callState = hallCalls.find((h) => h.floor === floor);
          const isUpActive = callState?.upActive ?? false;
          const isDownActive = callState?.downActive ?? false;
          const isAnyActive = isUpActive || isDownActive;

          return (
            <div
              key={floor}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all ${
                isAnyActive
                  ? 'border-amber-500/60 bg-amber-950/20 shadow-sm shadow-amber-950/40'
                  : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-900/60'
              }`}
            >
              {/* Floor Badge & Level info */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs font-mono transition-colors shrink-0 ${
                    isAnyActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {floor}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-200 leading-tight">
                    Floor {floor}
                  </span>
                  {isAnyActive && (
                    <span className="text-[9px] text-amber-400 font-mono animate-pulse leading-none mt-0.5">
                      Calling Car...
                    </span>
                  )}
                </div>
              </div>

              {/* Call Buttons UP / DOWN */}
              <div className="flex items-center gap-1 shrink-0">
                {floor < TOTAL_FLOORS ? (
                  <button
                    onClick={() => onHallCall(floor, 'UP')}
                    className={`h-7 px-2 rounded text-[11px] font-bold font-mono flex items-center gap-0.5 transition-all ${
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
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>UP</span>
                  </button>
                ) : (
                  <div className="w-[46px] h-7" /> // Placeholder for alignment at top floor
                )}

                {floor > 1 ? (
                  <button
                    onClick={() => onHallCall(floor, 'DOWN')}
                    className={`h-7 px-2 rounded text-[11px] font-bold font-mono flex items-center gap-0.5 transition-all ${
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
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span>DN</span>
                  </button>
                ) : (
                  <div className="w-[46px] h-7" /> // Placeholder for alignment at bottom floor
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
