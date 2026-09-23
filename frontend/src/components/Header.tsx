import React from 'react';
import { Activity, Clock, RotateCcw, Zap } from 'lucide-react';
import { SystemSnapshot } from '@elevator-sim/shared';

interface HeaderProps {
  isConnected: boolean;
  snapshot: SystemSnapshot | null;
  onSetSpeed: (speed: number) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  snapshot,
  onSetSpeed,
  onReset
}) => {
  const currentSpeed = snapshot?.simulationSpeed || 1;

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white text-xl shadow-rose-600/30 shadow-md">
          ES
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Elevator Simulator
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              10 Floors &times; 3 Cars
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Node.js + React.js &bull; Pure OOP &bull; LOOK/SCAN Multi-Car Dispatcher
          </p>
        </div>
      </div>

      {/* Telemetry metrics */}
      <div className="flex items-center gap-4 text-xs">
        <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">Total Served:</span>
          <span className="font-semibold text-white">{snapshot?.totalRequestsServed ?? 0}</span>
        </div>

        <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <span className="text-slate-400">Avg Wait Time:</span>
          <span className="font-semibold text-white">{snapshot?.averageWaitTimeSec ?? 0}s</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800">
          <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-slate-300 font-medium">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 px-2 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Speed:
          </span>
          {[1, 2, 5].map((speed) => (
            <button
              key={speed}
              onClick={() => onSetSpeed(speed)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                currentSpeed === speed
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          title="Reset simulation to initial state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>
    </header>
  );
};
