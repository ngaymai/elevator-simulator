import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  SystemSnapshot, 
  WS_EVENTS, 
  HallCallPayload, 
  CarCallPayload, 
  DoorControlPayload 
} from '@elevator-sim/shared';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export function useElevatorSocket() {
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on(WS_EVENTS.STATE_UPDATE, (data: SystemSnapshot) => {
      setSnapshot(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendHallCall = useCallback((floor: number, direction: 'UP' | 'DOWN') => {
    if (socketRef.current) {
      const payload: HallCallPayload = { floor, direction };
      socketRef.current.emit(WS_EVENTS.HALL_CALL, payload);
    }
  }, []);

  const sendCarCall = useCallback((carId: string, floor: number) => {
    if (socketRef.current) {
      const payload: CarCallPayload = { carId, floor };
      socketRef.current.emit(WS_EVENTS.CAR_CALL, payload);
    }
  }, []);

  const sendDoorControl = useCallback((carId: string, action: 'HOLD' | 'CLOSE_IMMEDIATELY') => {
    if (socketRef.current) {
      const payload: DoorControlPayload = { carId, action };
      socketRef.current.emit(WS_EVENTS.DOOR_CONTROL, payload);
    }
  }, []);

  const setSpeed = useCallback((multiplier: number) => {
    if (socketRef.current) {
      socketRef.current.emit(WS_EVENTS.SET_SPEED, multiplier);
    }
  }, []);

  const resetSimulation = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit(WS_EVENTS.RESET);
    }
  }, []);

  return {
    snapshot,
    isConnected,
    sendHallCall,
    sendCarCall,
    sendDoorControl,
    setSpeed,
    resetSimulation
  };
}
