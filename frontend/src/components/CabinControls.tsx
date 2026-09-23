import React from 'react';
import { ChevronsLeftRight, ChevronsRightLeft, UserCheck } from 'lucide-react';
import { ElevatorSnapshot, TOTAL_FLOORS } from '@elevator-sim/shared';

interface CabinControlsProps {
  elevators: ElevatorSnapshot[];
  onCarCall: (carId: string, floor: number) => void;
  onDoorControl: (carId: string, action: 'HOLD' | 'CLOSE_IMMEDIATELY') => void;
}

export const CabinControls: React.FC<CabinControlsProps> = ({
  elevators,
  onCarCall,
  onDoorControl
}) => {
  const floorButtons = Array.from({ length: TOTAL_FLOORS }, (_, i) => i + 1);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-300 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-rose-500" />
          Inside Cabin Controls (Passenger Destination Panels)
        </h2>
        <span className="text-xs text-slate-400">
          Click floors to set internal car destination
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {elevators.map((car) => {
          const isDoorOpen = car.doorState === 'OPEN' || car.doorState === 'OPENING';

          return (
            <div
              key={car.id}
              className="bg-slate-950 rounded-lg border border-slate-800 p-4 flex flex-col items-center shadow-inner"
            >
              <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-sm font-bold text-white">Car {car.id} Panel</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono ${
                    isDoorOpen
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  {isDoorOpen ? 'Boarding Allowed' : 'In Transit'}
                </span>
              </div>

              {/* Digital floor display inside car */}
              <div className="w-full bg-slate-900 border border-slate-800 rounded-md p-2 mb-4 flex items-center justify-around font-mono">
                <div className="text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Current</div>
                  <div className="text-xl font-bold text-rose-400">{car.currentFloor}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Direction</div>
                  <div className="text-sm font-bold text-slate-200">{car.direction}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Stops</div>
                  <div className="text-xs text-sky-400 font-semibold">
                    {car.assignedStops.length > 0 ? car.assignedStops.join(', ') : 'None'}
                  </div>
                </div>
              </div>

              {/* Keypad Grid 1-10 */}
              <div className="grid grid-cols-5 gap-2 w-full mb-4">
                {floorButtons.map((floor) => {
                  const isSelected = car.carRequests.includes(floor);
                  const isCurrent = car.currentFloor === floor;

                  return (
                    <button
                      key={floor}
                      onClick={() => onCarCall(car.id, floor)}
                      className={`h-9 rounded-md font-bold text-xs transition-all flex items-center justify-center border ${
                        isSelected
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/50 scale-105'
                          : isCurrent
                          ? 'bg-slate-800 text-rose-300 border-rose-900/50'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                      title={`Select Floor ${floor}`}
                    >
                      {floor}
                    </button>
                  );
                })}
              </div>

              {/* In-Cabin Door Controls */}
              <div className="w-full flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => onDoorControl(car.id, 'HOLD')}
                  disabled={!isDoorOpen}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1 border transition-colors ${
                    isDoorOpen
                      ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700'
                      : 'bg-slate-900 text-slate-700 border-slate-800/50 cursor-not-allowed'
                  }`}
                  title="Keep Door Open (<|>)"
                >
                  <ChevronsLeftRight className="w-4 h-4" /> &lt;|&gt; Hold
                </button>

                <button
                  onClick={() => onDoorControl(car.id, 'CLOSE_IMMEDIATELY')}
                  disabled={!isDoorOpen}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1 border transition-colors ${
                    isDoorOpen
                      ? 'bg-slate-800 hover:bg-slate-700 text-rose-400 border-slate-700'
                      : 'bg-slate-900 text-slate-700 border-slate-800/50 cursor-not-allowed'
                  }`}
                  title="Close Door Immediately (>|<)"
                >
                  <ChevronsRightLeft className="w-4 h-4" /> &gt;|&lt; Close
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
