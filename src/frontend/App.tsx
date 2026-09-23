import React from 'react';
import { useElevatorSocket } from './hooks/useElevatorSocket';
import { Header } from './components/Header';
import { ElevatorShaft } from './components/ElevatorShaft';
import { CabinControls } from './components/CabinControls';

export const App: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Header
        isConnected={isConnected}
        snapshot={snapshot}
        onSetSpeed={setSpeed}
        onReset={resetSimulation}
      />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* 10 floors x 3 elevators visual shafts */}
        <ElevatorShaft
          elevators={elevators}
          hallCalls={hallCalls}
          onHallCall={sendHallCall}
          onDoorControl={sendDoorControl}
        />

        {/* Inside Cabin Controls */}
        <CabinControls
          elevators={elevators}
          onCarCall={sendCarCall}
          onDoorControl={sendDoorControl}
        />
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        Autonomous Elevator Simulator &bull; Enterprise OOP Architecture &bull; Clean LOOK/SCAN Algorithm
      </footer>
    </div>
  );
};

export default App;
