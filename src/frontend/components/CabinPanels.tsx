import React, { useState } from 'react';
import { ChevronsLeftRight, ChevronsRightLeft, UserCheck } from 'lucide-react';
import { ElevatorSnapshot, TOTAL_FLOORS } from '@shared';

interface CabinPanelsProps {
  elevators: ElevatorSnapshot[];
  onCarCall: (carId: string, floor: number) => void;
  onDoorControl: (carId: string, action: 'HOLD' | 'CLOSE_IMMEDIATELY') => void;
}

export const CabinPanels: React.FC<CabinPanelsProps> = ({
  elevators,
  onCarCall,
  onDoorControl
}) => {
  const [selectedCarId, setSelectedCarId] = useState<string>('1');
  const floorButtons = Array.from({ length: TOTAL_FLOORS }, (_, i) => i + 1);

  const activeCar = elevators.find((e) => e.id === selectedCarId) || elevators[0];
  const isDoorOpen = activeCar?.doorState === 'OPEN' || activeCar?.doorState === 'OPENING';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-bold tracking-wide uppercase text-slate-200">
            Cabin Operating Panel (COP)
          </h3>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
          Internal Panel
        </span>
      </div>

      {/* Car Tab Selectors */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {elevators.map((car) => {
          const isSelected = car.id === selectedCarId;
          const carDoorOpen = car.doorState === 'OPEN' || car.doorState === 'OPENING';

          return (
            <button
              key={car.id}
              onClick={() => setSelectedCarId(car.id)}
              className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                isSelected
                  ? 'border-rose-500 bg-rose-950/40 text-rose-200 shadow-md shadow-rose-950/50'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>CAR {car.id}</span>
              <span className="text-[10px] font-mono text-slate-500">
                Fl {car.currentFloor} {carDoorOpen ? '• OPEN' : ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Car Display */}
      {activeCar && (
        <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 flex flex-col items-center">
          {/* Status strip */}
          <div className="w-full flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-slate-400">Current Position:</span>
            <span className="font-bold text-rose-400 text-sm">Floor {activeCar.currentFloor}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isDoorOpen
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              {isDoorOpen ? 'BOARDING ALLOWED' : 'IN TRANSIT'}
            </span>
          </div>

          {/* Keypad 1-10 */}
          <div className="grid grid-cols-5 gap-2 w-full mb-4">
            {floorButtons.map((floor) => {
              const isSelected = activeCar.carRequests.includes(floor);
              const isCurrent = activeCar.currentFloor === floor;

              return (
                <button
                  key={floor}
                  onClick={() => onCarCall(activeCar.id, floor)}
                  className={`h-10 rounded-lg font-mono font-bold text-xs transition-all flex items-center justify-center border ${
                    isSelected
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/50 scale-105'
                      : isCurrent
                      ? 'bg-slate-800 text-rose-400 border-rose-800/60'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
                  }`}
                  title={`Select Destination Floor ${floor}`}
                >
                  {floor}
                </button>
              );
            })}
          </div>

          {/* In-Cabin Door Controls */}
          <div className="w-full flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => onDoorControl(activeCar.id, 'HOLD')}
              disabled={!isDoorOpen}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                isDoorOpen
                  ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700 shadow-sm'
                  : 'bg-slate-900 text-slate-700 border-slate-800/50 cursor-not-allowed'
              }`}
              title="Hold Door Open (<|>)"
            >
              <ChevronsLeftRight className="w-4 h-4" /> &lt;|&gt; Hold Door
            </button>

            <button
              onClick={() => onDoorControl(activeCar.id, 'CLOSE_IMMEDIATELY')}
              disabled={!isDoorOpen}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                isDoorOpen
                  ? 'bg-slate-800 hover:bg-slate-700 text-rose-400 border-slate-700 shadow-sm'
                  : 'bg-slate-900 text-slate-700 border-slate-800/50 cursor-not-allowed'
              }`}
              title="Close Door Immediately (>|<)"
            >
              <ChevronsRightLeft className="w-4 h-4" /> &gt;|&lt; Close Door
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
