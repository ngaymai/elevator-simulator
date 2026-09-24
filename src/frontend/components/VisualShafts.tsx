import React from 'react';
import { ArrowUp, ArrowDown, Minus, ChevronsLeftRight, ChevronsRightLeft, UserCheck } from 'lucide-react';
import { ElevatorSnapshot, TOTAL_FLOORS } from '@shared';

interface VisualShaftsProps {
  elevators: ElevatorSnapshot[];
  selectedCarId: string;
  onSelectCar: (carId: string) => void;
  onCarCall: (carId: string, floor: number) => void;
  onDoorControl: (carId: string, action: 'HOLD' | 'CLOSE_IMMEDIATELY') => void;
}

export const VisualShafts: React.FC<VisualShaftsProps> = ({
  elevators,
  selectedCarId,
  onSelectCar,
  onCarCall,
  onDoorControl
}) => {
  const floors = Array.from({ length: TOTAL_FLOORS }, (_, i) => TOTAL_FLOORS - i);
  const floorButtons = Array.from({ length: TOTAL_FLOORS }, (_, i) => i + 1);
  const CABIN_HEIGHT = 82; // px

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div>
          <h2 className="text-sm font-bold tracking-wide uppercase text-slate-200">
            Elevator Hoistways &amp; Cabin Consoles
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Cross-section view with integrated in-car destination operating panels (COP).
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-500/40" /> Selected Cabin
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> In Transit
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Door Open
          </span>
        </div>
      </div>

      {/* Shafts Container */}
      <div className="flex-1 relative bg-slate-950 rounded-lg border border-slate-800 p-4 flex gap-4">
        {/* 3 Vertical Elevator Shafts */}
        {elevators.map((car) => {
          const isSelected = car.id === selectedCarId;
          // Precise mathematical ratio: Floor 1 = 0, Floor 10 = 1
          const ratio = (car.currentFloor - 1) / (TOTAL_FLOORS - 1);
          // Cabin bottom strictly bounds within [4px, 100% - CABIN_HEIGHT - 4px]
          // At Floor 1: bottom is 4px. Top is 86px.
          // At Floor 10: bottom is calc(100% - 86px). Top is calc(100% - 4px).
          const cabinBottom = `calc(4px + ${ratio} * (100% - ${CABIN_HEIGHT + 8}px))`;
          const cableBottom = `calc(4px + ${ratio} * (100% - ${CABIN_HEIGHT + 8}px) + ${CABIN_HEIGHT}px)`;

          const isDoorOpen = car.doorState === 'OPEN' || car.doorState === 'OPENING';
          const isDoorClosing = car.doorState === 'CLOSING';

          return (
            <div
              key={car.id}
              className="flex-1 relative flex flex-col rounded-xl border border-slate-800/80 bg-slate-900/40 overflow-hidden"
            >
              {/* Shaft Title Header (Click to focus car) */}
              <div
                onClick={() => onSelectCar(car.id)}
                className="w-full h-9 py-1.5 px-3 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between z-20 shrink-0 cursor-pointer hover:bg-slate-800/80 transition-colors"
                title={`Click to focus Car ${car.id}`}
              >
                <span className="text-xs font-bold text-slate-200">
                  SHAFT {car.id}
                </span>
                <span className="text-[10px] font-mono text-rose-400 font-semibold">
                  Floor {car.currentFloor}
                </span>
              </div>

              {/* Hoistway Track Area */}
              <div
                onClick={() => onSelectCar(car.id)}
                className="h-[460px] relative w-full overflow-hidden bg-slate-950/50 cursor-pointer"
              >
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
                  className={`absolute left-2.5 right-2.5 rounded-lg border-2 transition-all duration-700 ease-out shadow-2xl z-20 overflow-hidden flex flex-col ${
                    isSelected ? 'ring-2 ring-rose-500/50' : ''
                  }`}
                  style={{
                    bottom: cabinBottom,
                    height: `${CABIN_HEIGHT}px`,
                    borderColor: isDoorOpen
                      ? '#10b981'
                      : isSelected
                      ? '#f43f5e'
                      : car.direction !== 'IDLE'
                      ? '#e11d48'
                      : '#475569',
                    boxShadow: isSelected ? '0 0 16px rgba(244, 63, 94, 0.45)' : undefined,
                    backgroundColor: '#0f172a'
                  }}
                >
                  {/* Cabin Top LED Status Bar */}
                  <div
                    className={`h-[22px] px-2 py-0.5 border-b flex items-center justify-between text-[10px] font-mono shrink-0 transition-colors ${
                      isSelected ? 'bg-slate-900 border-rose-500/40' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <span className="font-bold text-rose-400 flex items-center gap-1">
                      Car {car.id}
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          onDoorControl(car.id, 'HOLD');
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          onDoorControl(car.id, 'CLOSE_IMMEDIATELY');
                        }}
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

              {/* Integrated In-Car Cabin Operating Panel (COP) */}
              <div className="border-t border-slate-800 bg-slate-950/95 p-2.5 flex flex-col gap-2 shrink-0">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-rose-400" />
                    <span className="font-bold text-slate-200">Car {car.id} Cabin</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      isDoorOpen
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : isDoorClosing
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {isDoorOpen ? `BOARDING (${car.doorDwellRemaining}s)` : isDoorClosing ? 'CLOSING' : 'TRANSIT'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-0.5">
                  <span>Destination:</span>
                  <span className="text-amber-400/90 text-[9px]">● Re-click to cancel</span>
                </div>

                {/* Keypad 1-10 (2 rows of 5) */}
                <div className="grid grid-cols-5 gap-1 w-full">
                  {floorButtons.map((floor) => {
                    const isQueued = car.carRequests.includes(floor);
                    const isAtFloor = car.currentFloor === floor;

                    return (
                      <button
                        key={floor}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCar(car.id);
                          onCarCall(car.id, floor);
                        }}
                        className={`h-8 rounded font-mono font-bold text-xs transition-all flex items-center justify-center border relative ${
                          isQueued
                            ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/50 scale-105 z-10'
                            : isAtFloor
                            ? 'bg-slate-800 text-rose-400 border-rose-800/80 font-bold'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
                        }`}
                        title={
                          isQueued
                            ? `Floor ${floor} queued — Click again to cancel`
                            : `Press Floor ${floor} inside Car ${car.id}`
                        }
                      >
                        {floor}
                        {isQueued && (
                          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* In-Cabin Door Controls */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-900">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDoorControl(car.id, 'HOLD');
                    }}
                    disabled={!isDoorOpen}
                    className={`py-1 px-1.5 rounded text-[10px] font-bold font-mono flex items-center justify-center gap-1 border transition-all ${
                      isDoorOpen
                        ? 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border-emerald-800/60 shadow-sm'
                        : 'bg-slate-950 text-slate-700 border-slate-900 cursor-not-allowed'
                    }`}
                    title="Hold Door Open (<|>)"
                  >
                    <ChevronsLeftRight className="w-3.5 h-3.5" /> Hold
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDoorControl(car.id, 'CLOSE_IMMEDIATELY');
                    }}
                    disabled={!isDoorOpen}
                    className={`py-1 px-1.5 rounded text-[10px] font-bold font-mono flex items-center justify-center gap-1 border transition-all ${
                      isDoorOpen
                        ? 'bg-slate-900 hover:bg-slate-800 text-rose-400 border-rose-800/60 shadow-sm'
                        : 'bg-slate-950 text-slate-700 border-slate-900 cursor-not-allowed'
                    }`}
                    title="Close Door Immediately (>|<)"
                  >
                    <ChevronsRightLeft className="w-3.5 h-3.5" /> Close
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
