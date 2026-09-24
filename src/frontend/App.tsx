import React, { useState } from 'react';
import { useElevatorSocket } from './hooks/useElevatorSocket';
import { Header } from './components/Header';
import { FloorLobby } from './components/FloorLobby';
import { VisualShafts } from './components/VisualShafts';
import { ActivityLogFeed } from './components/ActivityLogFeed';

export const App: React.FC = () => {
  const [selectedCarId, setSelectedCarId] = useState<string>('1');
  const {
    snapshot,
    isConnected,
    sendHallCall,
    sendCarCall,
    sendDoorControl,
    setSpeed,
    resetSimulation
  } = useElevatorSocket();

  const elevators = snapshot?.elevators || [
    {
      id: '1',
      currentFloor: 1,
      direction: 'IDLE',
      status: 'IDLE',
      doorState: 'CLOSED',
      doorDwellRemaining: 0,
      assignedStops: [],
      carRequests: [],
      passengersCount: 0
    },
    {
      id: '2',
      currentFloor: 1,
      direction: 'IDLE',
      status: 'IDLE',
      doorState: 'CLOSED',
      doorDwellRemaining: 0,
      assignedStops: [],
      carRequests: [],
      passengersCount: 0
    },
    {
      id: '3',
      currentFloor: 1,
      direction: 'IDLE',
      status: 'IDLE',
      doorState: 'CLOSED',
      doorDwellRemaining: 0,
      assignedStops: [],
      carRequests: [],
      passengersCount: 0
    }
  ];

  const hallCalls = snapshot?.hallCalls || [];
  const activityLogs = snapshot?.activityLogs || [];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Header
        isConnected={isConnected}
        snapshot={snapshot}
        onSetSpeed={setSpeed}
        onReset={resetSimulation}
      />

      <main className="flex-1 p-6 max-w-[1550px] mx-auto w-full">
        {/* 3-Panel Intuitive Layout: 3 cols Lobby - 6 cols Hoistways & Consoles - 3 cols Telemetry & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Panel 1: Sảnh các tầng (Floor Lobby Call Panel) - 3 cols */}
          <div className="lg:col-span-3">
            <FloorLobby hallCalls={hallCalls} onHallCall={sendHallCall} />
          </div>

          {/* Panel 2: Giếng thang máy vật lý & Bảng điều khiển Cabin tích hợp (Visual Hoistways & Integrated COP) - 6 cols */}
          <div className="lg:col-span-6">
            <VisualShafts
              elevators={elevators}
              selectedCarId={selectedCarId}
              onSelectCar={setSelectedCarId}
              onCarCall={sendCarCall}
              onDoorControl={sendDoorControl}
            />
          </div>

          {/* Panel 3: Giám sát Dispatcher & Nhật ký thời gian thực - 3 cols */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* System Performance & Dispatcher Stats Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Dispatcher Telemetry
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                  LOOK/SCAN Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Served Trips</div>
                  <div className="text-lg font-bold text-rose-400 mt-0.5">
                    {snapshot?.totalPassengersServed ?? 0}
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Active Calls</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">
                    {hallCalls.filter(h => h.upActive || h.downActive).length}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between px-1">
                <span>Ticks Processed:</span>
                <span className="text-slate-200 font-bold">{snapshot?.tickCount ?? 0} ticks</span>
              </div>
            </div>

            {/* Live Activity Decision Feed */}
            <ActivityLogFeed logs={activityLogs} className="h-[440px]" />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-3.5 text-center text-xs text-slate-500 font-mono">
        Elevator Supervisory & Traffic Management System &bull; Active Operations Console
      </footer>
    </div>
  );
};

export default App;
