import React, { useState } from 'react';
import { useElevatorSocket } from './hooks/useElevatorSocket';
import { Header } from './components/Header';
import { FloorLobby } from './components/FloorLobby';
import { VisualShafts } from './components/VisualShafts';
import { CabinPanels } from './components/CabinPanels';
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
        {/* 3-Panel Intuitive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Panel 1: Sảnh các tầng (Floor Lobby Call Panel) */}
          <div className="lg:col-span-3">
            <FloorLobby hallCalls={hallCalls} onHallCall={sendHallCall} />
          </div>

          {/* Panel 2: Giếng thang máy vật lý & Cabin trượt (Visual Hoistways) */}
          <div className="lg:col-span-5">
            <VisualShafts
              elevators={elevators}
              selectedCarId={selectedCarId}
              onSelectCar={setSelectedCarId}
              onDoorControl={sendDoorControl}
            />
          </div>

          {/* Panel 3: Bảng điều khiển Cabin & Live Decision Feed */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <CabinPanels
              elevators={elevators}
              selectedCarId={selectedCarId}
              onSelectCar={setSelectedCarId}
              onCarCall={sendCarCall}
              onDoorControl={sendDoorControl}
            />
            <ActivityLogFeed logs={activityLogs} />
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
