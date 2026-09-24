/**
 * Common types and constants for the Elevator Simulator System
 */

export const TOTAL_FLOORS = 10;
export const MIN_FLOOR = 1;
export const MAX_FLOOR = 10;
export const TOTAL_ELEVATORS = 3;
export const DEFAULT_TRANSIT_TIME_SEC = 1.0;
export const DEFAULT_DOOR_DWELL_SEC = 2.0;

export type Direction = 'UP' | 'DOWN' | 'IDLE';

export type ElevatorStatus = 
  | 'IDLE' 
  | 'MOVING_UP' 
  | 'MOVING_DOWN' 
  | 'DOOR_OPENING' 
  | 'DOOR_OPEN' 
  | 'DOOR_CLOSING';

export type DoorState = 
  | 'CLOSED' 
  | 'OPENING' 
  | 'OPEN' 
  | 'CLOSING';

export type RequestType = 'HALL_CALL' | 'CAR_CALL';

export interface HallCallPayload {
  floor: number;
  direction: 'UP' | 'DOWN';
}

export interface CarCallPayload {
  carId: string;
  floor: number;
}

export interface DoorControlPayload {
  carId: string;
  action: 'HOLD' | 'CLOSE_IMMEDIATELY';
}

export interface ElevatorSnapshot {
  id: string;
  currentFloor: number;
  direction: Direction;
  status: ElevatorStatus;
  doorState: DoorState;
  doorDwellRemaining: number;
  assignedStops: number[];
  carRequests: number[];
  passengersCount: number;
}

export interface HallCallState {
  floor: number;
  upActive: boolean;
  downActive: boolean;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: number;
  type: 'DISPATCH' | 'DECISION' | 'BOARDING' | 'DOOR' | 'SYSTEM';
  carId?: string;
  floor?: number;
  message: string;
}

export interface SystemSnapshot {
  timestamp: number;
  tickCount: number;
  simulationSpeed: number; // 1x, 2x, 5x
  elevators: ElevatorSnapshot[];
  hallCalls: HallCallState[];
  totalRequestsServed: number;
  averageWaitTimeSec: number;
  activityLogs?: ActivityLogEntry[];
}

// WebSocket Event Names
export const WS_EVENTS = {
  // Client -> Server
  HALL_CALL: 'elevator:hall_call',
  CAR_CALL: 'elevator:car_call',
  DOOR_CONTROL: 'elevator:door_control',
  SET_SPEED: 'simulation:set_speed',
  RESET: 'simulation:reset',
  
  // Server -> Client
  STATE_UPDATE: 'simulation:state_update',
  NOTIFICATION: 'simulation:notification',
} as const;
