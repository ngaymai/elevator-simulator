import React from 'react';
import { ArrowUp, ArrowDown, Minus, ChevronsLeftRight, ChevronsRightLeft } from 'lucide-react';
import { ElevatorSnapshot, TOTAL_FLOORS } from '@shared';

interface VisualShaftsProps {
  elevators: ElevatorSnapshot[];
  onDoorControl: (carId: string, action: 'HOLD' | 'CLOSE_IMMEDIATELY') => void;
}

export const VisualShafts: React.FC<VisualShaftsProps> = ({ elevators, onDoorControl }) => {
  const floors = Array.from({ length: TOTAL_FLOORS }, (_, i) => TOTAL_FLOORS - i);
  const CABIN_HEIGHT = 82; // px

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <h2 className="text-sm font-bold tracking-wide uppercase text-slate-200">
          Elevator Hoistways (Visual Shaft Cross-Section)
        </h2>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Active Motion
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Door Open
          </span>
        </div>
      </div>

      {/* Shafts Container */}
      <div className="flex-1 relative bg-slate-950 rounded-lg border border-slate-800 p-4 min-h-[560px] flex gap-4">
        {/* 3 Vertical Elevator Shafts */}
        {elevators.map((car) => {
          // Precise mathematical ratio: Floor 1 = 0, Floor 10 = 1
          const ratio = (car.currentFloor - 1) / (TOTAL_FLOORS - 1);
          // Cabin bottom strictly bounds within [4px, 100% - CABIN_HEIGHT - 4px]
          // At Floor 1: bottom is 4px. Top is 86px.
          // At Floor 10: bottom is calc(100% - 86px). Top is calc(100% - 4px).
          // Overflow beyond hoistway header is mathematically impossible.
          const cabinBottom = `calc(4px + ${ratio} * (100% - ${CABIN_HEIGHT + 8}px))`;
          const cableBottom = `calc(4px + ${ratio} * (100% - ${CABIN_HEIGHT + 8}px) + ${CABIN_HEIGHT}px)`;

          const isDoorOpen = car.doorState === 'OPEN' || car.doorState === 'OPENING';
          const isDoorClosing = car.doorState === 'CLOSING';

          return (
            <div
              key={car.id}
              className="flex-1 relative flex flex-col bg-slate-900/40 rounded-lg border border-slate-800/80 overflow-hidden"
            >
              {/* Shaft Title Header (Fixed height, isolated from hoistway track) */}
              <div className="w-full h-9 bg-slate-900/95 py-1.5 px-3 border-b border-slate-800 flex items-center justify-between z-20 shrink-0">
                <span className="text-xs font-bold text-slate-200">
                  SHAFT {car.id}
                </span>
                <span className="text-[10px] font-mono text-rose-400 font-semibold">
                  Floor {car.currentFloor}
                </span>
              </div>

              {/* Hoistway Track Area */}
              <div className="flex-1 relative w-full overflow-hidden bg-slate-950/50">
                {/* Horizontal floor guidelines matching exact stopping landing coordinates */}
                {floors.map((floor) => {
                  const floorRatio = (floor - 1) / (TOTAL_FLOORS - 1);
                  const lineBottom = `calc(4px + ${floorRatio} * (100% - ${CABIN_HEIGHT + 8}px))`;
                  return (
                    <div
                      key={floor}
                      className="absolute left-0 right-0 border-b border-slate-800/60 pointer-events-none flex items-center justify-between px-2 text-[9px] font-mono text-slate-600"
                      style={{ bottom: lineBottom }}
                    >
                      <span>Fl {floor}</span>
                      <span>Fl {floor}</span>
                    </div>
                  );
                })}

                {/* Center vertical guide rail line */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-slate-800/90 pointer-events-none" />

                {/* Hoist Machine Pulley at Shaft Top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center z-10 pointer-events-none shadow-sm">
                  <div className="w-1 h-1 rounded-full bg-slate-400" />
                </div>

                {/* Suspension Cable from top down to car roof */}
                <div
                  className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 bg-slate-400/70 shadow-sm transition-all duration-700 ease-out pointer-events-none"
                  style={{ bottom: cableBottom }}
                />

                {/* Moving Elevator Cabin */}
                <div
                  className="absolute left-2.5 right-2.5 rounded-lg border-2 transition-all duration-700 ease-out shadow-2xl z-20 overflow-hidden flex flex-col"
                  style={{
                    bottom: cabinBottom,
                    height: `${CABIN_HEIGHT}px`,
                    borderColor: isDoorOpen ? '#10b981' : car.direction !== 'IDLE' ? '#e11d48' : '#475569',
                    backgroundColor: '#0f172a'
                  }}
                >
                  {/* Cabin Top LED Status Bar */}
                  <div className="h-[22px] bg-slate-950 px-2 py-0.5 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono shrink-0">
                    <span className="font-bold text-rose-400">
                      Car {car.id}
                    </span>

                    <div className="flex items-center gap-1 font-bold">
                      {car.direction === 'UP' && (
                        <span className="text-rose-400 flex items-center gap-0.5 animate-pulse">
                          <ArrowUp className="w-3 h-3" /> UP
                        </span>
                      )}
                      {car.direction === 'DOWN' && (
                        <span className="text-rose-400 flex items-center gap-0.5 animate-pulse">
                          <ArrowDown className="w-3 h-3" /> DN
                        </span>
                      )}
                      {car.direction === 'IDLE' && (
                        <span className="text-slate-500 flex items-center gap-0.5">
                          <Minus className="w-3 h-3" /> IDLE
                        </span>
                      )}
                    </div>

                    <span className="font-bold text-slate-200">
                      Fl {car.currentFloor}
                    </span>
                  </div>

                  {/* Cabin Body with Double Sliding Doors */}
                  <div className="flex-1 relative flex items-center justify-center bg-slate-900 overflow-hidden min-h-[36px]">
                    {/* Cabin Interior (visible when doors open) */}
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-1 text-center">
                      <span className="text-[10px] text-emerald-400 font-mono font-bold leading-none mb-0.5">
                        {isDoorOpen ? `BOARDING (${car.doorDwellRemaining}s)` : 'CABIN'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono truncate max-w-[90%] leading-none">
                        {car.assignedStops.length > 0 ? `Next: ${car.assignedStops.join(',')}` : 'No Stops'}
                      </span>
                    </div>

                    {/* Left Sliding Door */}
                    <div
                      className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-slate-700 to-slate-600 border-r border-slate-800 transition-transform duration-300 ease-in-out z-10 flex items-center justify-end pr-1"
                      style={{
                        transform: isDoorOpen ? 'translateX(-100%)' : 'translateX(0)'
                      }}
                    >
                      <div className="w-0.5 h-5 bg-slate-500 rounded" />
                    </div>

                    {/* Right Sliding Door */}
                    <div
                      className="absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-l from-slate-700 to-slate-600 border-l border-slate-800 transition-transform duration-300 ease-in-out z-10 flex items-center justify-start pl-1"
                      style={{
                        transform: isDoorOpen ? 'translateX(100%)' : 'translateX(0)'
                      }}
                    >
                      <div className="w-0.5 h-5 bg-slate-500 rounded" />
                    </div>
                  </div>

                  {/* Cabin Door Mini Quick Controls */}
                  <div className="h-[22px] bg-slate-950 px-2 py-0.5 border-t border-slate-800 flex items-center justify-between text-[10px] shrink-0">
                    <span className="text-[9px] font-mono">
                      {isDoorOpen ? (
                        <span className="text-emerald-400 font-semibold">OPEN</span>
                      ) : isDoorClosing ? (
                        <span className="text-amber-400 font-semibold">CLOSING</span>
                      ) : (
                        <span className="text-slate-500">CLOSED</span>
                      )}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onDoorControl(car.id, 'HOLD')}
                        disabled={!isDoorOpen}
                        className={`p-0.5 rounded transition-colors ${
                          isDoorOpen
                            ? 'text-emerald-400 hover:bg-slate-800'
                            : 'text-slate-700 cursor-not-allowed'
                        }`}
                        title="Keep Door Open (<|>)"
                      >
                        <ChevronsLeftRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDoorControl(car.id, 'CLOSE_IMMEDIATELY')}
                        disabled={!isDoorOpen}
                        className={`p-0.5 rounded transition-colors ${
                          isDoorOpen
                            ? 'text-rose-400 hover:bg-slate-800'
                            : 'text-slate-700 cursor-not-allowed'
                        }`}
                        title="Force Close Door (>|<)"
                      >
                        <ChevronsRightLeft className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
