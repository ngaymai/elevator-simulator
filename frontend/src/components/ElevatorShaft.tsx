import React from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeftRight, 
  ChevronsRightLeft, 
  Minus 
} from 'lucide-react';
import { 
  ElevatorSnapshot, 
  HallCallState, 
  TOTAL_FLOORS 
} from '@elevator-sim/shared';

interface ElevatorShaftProps {
  elevators: ElevatorSnapshot[];
  hallCalls: HallCallState[];
  onHallCall: (floor: number, direction: 'UP' | 'DOWN') => void;
  onDoorControl: (carId: string, action: 'HOLD' | 'CLOSE_IMMEDIATELY') => void;
}

export const ElevatorShaft: React.FC<ElevatorShaftProps> = ({
  elevators,
  hallCalls,
  onHallCall,
  onDoorControl
}) => {
  // Generate array of floors from 10 down to 1
  const floors = Array.from({ length: TOTAL_FLOORS }, (_, i) => TOTAL_FLOORS - i);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-300">
          Building Elevator Shafts (Floors 10 - 1)
        </h2>
        <div className="flex gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Active Car
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Pending Call
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Door Open
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {elevators.map((car) => {
          return (
            <div key={car.id} className="flex flex-col bg-slate-950 rounded-lg border border-slate-800 p-3 shadow-inner">
              {/* Shaft Header */}
              <div className="text-center pb-2 mb-2 border-b border-slate-800">
                <span className="text-sm font-bold text-white tracking-wide">
                  ELEVATOR {car.id}
                </span>
                <div className="text-xs text-slate-400 flex items-center justify-center gap-2 mt-0.5">
                  <span>Floor: <strong className="text-rose-400">{car.currentFloor}</strong></span>
                  <span>&bull;</span>
                  <span className="font-mono uppercase text-slate-300">{car.status.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Floors Grid */}
              <div className="flex flex-col gap-1.5">
                {floors.map((floor) => {
                  const isCarHere = car.currentFloor === floor;
                  const floorHallCall = hallCalls.find((h) => h.floor === floor);
                  const isUpActive = floorHallCall?.upActive ?? false;
                  const isDownActive = floorHallCall?.downActive ?? false;

                  return (
                    <div
                      key={floor}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-md border text-xs transition-all ${
                        isCarHere
                          ? 'border-rose-500 bg-rose-950/30 shadow-md shadow-rose-950/50'
                          : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70'
                      }`}
                    >
                      {/* Left: Hall Call Buttons */}
                      <div className="flex items-center gap-1">
                        {floor < TOTAL_FLOORS && (
                          <button
                            onClick={() => onHallCall(floor, 'UP')}
                            className={`p-1 rounded transition-colors ${
                              isUpActive
                                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm shadow-amber-400/50'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                            }`}
                            title={`Call Elevator at Floor ${floor} UP`}
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {floor > 1 && (
                          <button
                            onClick={() => onHallCall(floor, 'DOWN')}
                            className={`p-1 rounded transition-colors ${
                              isDownActive
                                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm shadow-amber-400/50'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                            }`}
                            title={`Call Elevator at Floor ${floor} DOWN`}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Center: Car Slot / Visual Cabin */}
                      <div className="flex-1 mx-3 flex items-center justify-center">
                        {isCarHere ? (
                          <div className="w-full flex items-center justify-between bg-slate-900 border-2 border-rose-500 rounded px-2.5 py-1">
                            <span className="font-bold text-rose-300 text-sm">{floor}</span>

                            {/* Motion Direction Indicator */}
                            <div className="flex items-center gap-1">
                              {car.direction === 'UP' && (
                                <span className="flex items-center text-rose-400 font-bold animate-pulse">
                                  <ArrowUp className="w-3.5 h-3.5" /> UP
                                </span>
                              )}
                              {car.direction === 'DOWN' && (
                                <span className="flex items-center text-rose-400 font-bold animate-pulse">
                                  <ArrowDown className="w-3.5 h-3.5" /> DN
                                </span>
                              )}
                              {car.direction === 'IDLE' && (
                                <span className="flex items-center text-slate-500">
                                  <Minus className="w-3.5 h-3.5" /> IDLE
                                </span>
                              )}
                            </div>

                            {/* Animated Door State */}
                            <div className="flex items-center gap-1 text-[11px] font-mono">
                              {car.doorState === 'OPEN' && (
                                <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1 rounded border border-emerald-500/50">
                                  OPEN ({car.doorDwellRemaining}s)
                                </span>
                              )}
                              {car.doorState === 'OPENING' && (
                                <span className="text-sky-400 animate-pulse bg-sky-950/60 px-1 rounded border border-sky-500/50">
                                  OPENING...
                                </span>
                              )}
                              {car.doorState === 'CLOSING' && (
                                <span className="text-amber-400 animate-pulse bg-amber-950/60 px-1 rounded border border-amber-500/50">
                                  CLOSING...
                                </span>
                              )}
                              {car.doorState === 'CLOSED' && (
                                <span className="text-slate-500">CLOSED</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-700 font-mono text-xs">{floor}</div>
                        )}
                      </div>

                      {/* Right: Door Controls (<|> and >|<) for current floor */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onDoorControl(car.id, 'HOLD')}
                          disabled={!isCarHere || (car.doorState !== 'OPEN' && car.doorState !== 'OPENING')}
                          className={`p-1 rounded transition-colors ${
                            isCarHere && (car.doorState === 'OPEN' || car.doorState === 'OPENING')
                              ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700'
                              : 'bg-slate-900 text-slate-700 cursor-not-allowed border border-transparent'
                          }`}
                          title="Hold Door Open (<|>)"
                        >
                          <ChevronsLeftRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDoorControl(car.id, 'CLOSE_IMMEDIATELY')}
                          disabled={!isCarHere || (car.doorState !== 'OPEN' && car.doorState !== 'OPENING')}
                          className={`p-1 rounded transition-colors ${
                            isCarHere && (car.doorState === 'OPEN' || car.doorState === 'OPENING')
                              ? 'bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700'
                              : 'bg-slate-900 text-slate-700 cursor-not-allowed border border-transparent'
                          }`}
                          title="Close Door Immediately (>|<)"
                        >
                          <ChevronsRightLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
