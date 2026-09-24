import { 
  ActivityLogEntry,
  DEFAULT_DOOR_DWELL_SEC, 
  DEFAULT_TRANSIT_TIME_SEC, 
  DoorControlPayload, 
  HallCallState, 
  MAX_FLOOR, 
  MIN_FLOOR, 
  SystemSnapshot, 
  TOTAL_ELEVATORS, 
  TOTAL_FLOORS 
} from '@shared';
import { Elevator } from '../domain/entities/Elevator';
import { HallCallRequest } from '../domain/entities/ElevatorRequest';
import { IElevatorDispatcher } from '../domain/dispatchers/IElevatorDispatcher';
import { ETADispatcher } from '../domain/dispatchers/ETADispatcher';

/**
 * Orchestrator coordinating 3 parallel elevators, central dispatching,
 * discrete time simulation clock, and performance telemetry.
 */
export class SimulationEngine {
  readonly #elevators: Elevator[] = [];
  #dispatcher: IElevatorDispatcher;
  readonly #hallCalls: Map<string, { floor: number; direction: 'UP' | 'DOWN'; timestamp: number }> = new Map();
  readonly #activityLogs: ActivityLogEntry[] = [];
  #tickCount: number = 0;
  #simulationSpeed: number = 1;
  #totalServed: number = 0;
  #totalWaitDurationSec: number = 0;
  #timer: NodeJS.Timeout | null = null;
  #onSnapshotCallback?: (snapshot: SystemSnapshot) => void;

  #addLog(type: ActivityLogEntry['type'], message: string, carId?: string, floor?: number): void {
    const entry: ActivityLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      type,
      carId,
      floor,
      message
    };
    this.#activityLogs.unshift(entry);
    if (this.#activityLogs.length > 25) {
      this.#activityLogs.pop();
    }
  }

  constructor(dispatcher?: IElevatorDispatcher) {
    this.#dispatcher = dispatcher ?? new ETADispatcher(DEFAULT_TRANSIT_TIME_SEC, DEFAULT_DOOR_DWELL_SEC);

    // Initialize 3 parallel elevators (IDs: '1', '2', '3' per diagram)
    for (let i = 1; i <= TOTAL_ELEVATORS; i++) {
      this.#elevators.push(new Elevator(i.toString(), 1, 2));
    }
  }

  public setSnapshotCallback(callback: (snapshot: SystemSnapshot) => void): void {
    this.#onSnapshotCallback = callback;
  }

  public setDispatcher(dispatcher: IElevatorDispatcher): void {
    this.#dispatcher = dispatcher;
  }

  /**
   * Dispatches external hall call to the most optimal car using the active strategy.
   */
  public handleHallCall(floor: number, direction: 'UP' | 'DOWN'): void {
    if (floor < MIN_FLOOR || floor > MAX_FLOOR) {
      return;
    }
    // Floor 1 has no DOWN; Floor 10 has no UP
    if ((floor === MIN_FLOOR && direction === 'DOWN') || (floor === MAX_FLOOR && direction === 'UP')) {
      return;
    }

    const key = `${floor}:${direction}`;
    if (!this.#hallCalls.has(key)) {
      // Immediate boarding optimization: if an elevator is already at this floor with doors open
      const alreadyPresentCar = this.#elevators.find(e => 
        e.currentFloor === floor && 
        (e.doorState === 'OPEN' || e.doorState === 'OPENING') &&
        (e.direction === direction || e.direction === 'IDLE')
      );

      if (alreadyPresentCar) {
        alreadyPresentCar.holdDoor();
        this.#totalServed += 1;
        this.#addLog('BOARDING', `Car ${alreadyPresentCar.id} is already at Floor ${floor}. Door held open for passenger boarding.`, alreadyPresentCar.id, floor);
        this.#emitUpdate();
        return;
      }

      this.#hallCalls.set(key, { floor, direction, timestamp: Date.now() });

      const request = new HallCallRequest(floor, direction);
      const chosenElevator = this.#dispatcher.selectElevator(this.#elevators, request);
      chosenElevator.assignHallCall(request);
      this.#addLog('DISPATCH', `Hall call at Floor ${floor} ${direction} assigned to Car ${chosenElevator.id} (Optimal ETA).`, chosenElevator.id, floor);

      this.#emitUpdate();
    }
  }

  /**
   * Registers internal destination request for a specific elevator car.
   */
  public handleCarCall(carId: string, floor: number): void {
    const elevator = this.#elevators.find(e => e.id === carId);
    if (elevator) {
      elevator.addDestination(floor);
      this.#addLog('DECISION', `Car ${carId}: Cabin destination Floor ${floor} registered.`, carId, floor);
      this.#emitUpdate();
    }
  }

  /**
   * Processes manual door controls (<|> Hold, >|< Close Immediately).
   */
  public handleDoorControl(payload: DoorControlPayload): void {
    const elevator = this.#elevators.find(e => e.id === payload.carId);
    if (!elevator) {
      return;
    }

    if (payload.action === 'HOLD') {
      elevator.holdDoor();
      this.#addLog('DOOR', `Car ${payload.carId}: Door Hold (<|>) activated.`, payload.carId);
    } else if (payload.action === 'CLOSE_IMMEDIATELY') {
      elevator.closeDoorImmediately();
      this.#addLog('DOOR', `Car ${payload.carId}: Door Force Close (>|<) activated.`, payload.carId);
    }
    this.#emitUpdate();
  }

  /**
   * Sets simulation speed multiplier (1x, 2x, 5x).
   */
  public setSpeed(multiplier: number): void {
    this.#simulationSpeed = Math.max(0.5, Math.min(10, multiplier));
    if (this.#timer) {
      this.stop();
      this.start();
    }
  }

  /**
   * Advances system clock by 1 discrete step.
   */
  public tick(): SystemSnapshot {
    this.#tickCount += 1;

    for (const elevator of this.#elevators) {
      const prevFloor = elevator.currentFloor;
      const prevDoor = elevator.doorState;
      const snapshot = elevator.advanceTick();

      // Check if a hall call at this floor was served
      if (snapshot.doorState === 'OPEN') {
        if (prevDoor !== 'OPEN') {
          this.#addLog('BOARDING', `Car ${snapshot.id} arrived at Floor ${snapshot.currentFloor}. Doors opened.`, snapshot.id, snapshot.currentFloor);
        }

        const upKey = `${snapshot.currentFloor}:UP`;
        const downKey = `${snapshot.currentFloor}:DOWN`;

        if (this.#hallCalls.has(upKey) && (snapshot.direction === 'UP' || snapshot.direction === 'IDLE')) {
          const call = this.#hallCalls.get(upKey)!;
          this.#totalServed += 1;
          this.#totalWaitDurationSec += (Date.now() - call.timestamp) / 1000;
          this.#hallCalls.delete(upKey);
        }

        if (this.#hallCalls.has(downKey) && (snapshot.direction === 'DOWN' || snapshot.direction === 'IDLE')) {
          const call = this.#hallCalls.get(downKey)!;
          this.#totalServed += 1;
          this.#totalWaitDurationSec += (Date.now() - call.timestamp) / 1000;
          this.#hallCalls.delete(downKey);
        }
      }
    }

    const currentSnapshot = this.getSystemSnapshot();
    if (this.#onSnapshotCallback) {
      this.#onSnapshotCallback(currentSnapshot);
    }
    return currentSnapshot;
  }

  public start(): void {
    if (this.#timer) {
      return;
    }
    const intervalMs = Math.round(1000 / this.#simulationSpeed);
    this.#timer = setInterval(() => {
      this.tick();
    }, intervalMs);
  }

  public stop(): void {
    if (this.#timer) {
      clearInterval(this.#timer);
      this.#timer = null;
    }
  }

  public reset(): void {
    this.stop();
    this.#tickCount = 0;
    this.#totalServed = 0;
    this.#totalWaitDurationSec = 0;
    this.#hallCalls.clear();
    this.#activityLogs.length = 0;
    this.#addLog('SYSTEM', 'Simulation reset: All cars idle at Floor 1.');
    for (const elevator of this.#elevators) {
      elevator.reset(1);
    }
    this.start();
    this.#emitUpdate();
  }

  public getSystemSnapshot(): SystemSnapshot {
    const hallCallStates: HallCallState[] = [];
    for (let f = 1; f <= TOTAL_FLOORS; f++) {
      hallCallStates.push({
        floor: f,
        upActive: this.#hallCalls.has(`${f}:UP`),
        downActive: this.#hallCalls.has(`${f}:DOWN`)
      });
    }

    const avgWaitTime = this.#totalServed > 0 
      ? Number((this.#totalWaitDurationSec / this.#totalServed).toFixed(1)) 
      : 0;

    return {
      timestamp: Date.now(),
      tickCount: this.#tickCount,
      simulationSpeed: this.#simulationSpeed,
      elevators: this.#elevators.map(e => e.getSnapshot()),
      hallCalls: hallCallStates,
      totalRequestsServed: this.#totalServed,
      averageWaitTimeSec: avgWaitTime,
      activityLogs: [...this.#activityLogs]
    };
  }

  #emitUpdate(): void {
    if (this.#onSnapshotCallback) {
      this.#onSnapshotCallback(this.getSystemSnapshot());
    }
  }
}
