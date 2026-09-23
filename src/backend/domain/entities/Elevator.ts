import { 
  Direction, 
  DoorState, 
  ElevatorSnapshot, 
  ElevatorStatus, 
  MAX_FLOOR, 
  MIN_FLOOR 
} from '@shared';
import { Door } from './Door';
import { ElevatorRequest, HallCallRequest, CarCallRequest } from './ElevatorRequest';

/**
 * Core Elevator Entity representing an autonomous car.
 * Strictly adheres to OOP Encapsulation and LOOK/SCAN directional rules.
 */
export class Elevator {
  readonly #id: string;
  #currentFloor: number = 1;
  #direction: Direction = 'IDLE';
  #status: ElevatorStatus = 'IDLE';
  readonly #door: Door;
  readonly #assignedRequests: ElevatorRequest[] = [];

  constructor(id: string, initialFloor: number = 1, defaultDwellTicks: number = 2) {
    this.#id = id;
    this.#currentFloor = Math.max(MIN_FLOOR, Math.min(MAX_FLOOR, initialFloor));
    this.#door = new Door(defaultDwellTicks);
  }

  public get id(): string {
    return this.#id;
  }

  public get currentFloor(): number {
    return this.#currentFloor;
  }

  public get direction(): Direction {
    return this.#direction;
  }

  public get status(): ElevatorStatus {
    return this.#status;
  }

  public get doorState(): DoorState {
    return this.#door.getState();
  }

  public get assignedRequests(): readonly ElevatorRequest[] {
    return this.#assignedRequests;
  }

  public get stops(): number[] {
    const stopsSet = new Set<number>();
    for (const req of this.#assignedRequests) {
      if (!req.isServed) {
        stopsSet.add(req.floor);
      }
    }
    return Array.from(stopsSet).sort((a, b) => a - b);
  }

  /**
   * Internal Car Call: passenger inside cabin selects a destination floor.
   */
  public addDestination(destinationFloor: number): void {
    if (destinationFloor < MIN_FLOOR || destinationFloor > MAX_FLOOR) {
      return;
    }

    // If already at this floor and door is open, nothing needed
    if (destinationFloor === this.#currentFloor && this.#door.isOpen()) {
      return;
    }

    const alreadyQueued = this.#assignedRequests.some(
      r => !r.isServed && r instanceof CarCallRequest && r.floor === destinationFloor
    );

    if (!alreadyQueued) {
      this.#assignedRequests.push(new CarCallRequest(this.#id, destinationFloor));
      this.#updateDirectionIfIdle();
    }
  }

  /**
   * External Hall Call: Dispatcher assigns an external request to this car.
   */
  public assignHallCall(request: HallCallRequest): void {
    const alreadyQueued = this.#assignedRequests.some(
      r => !r.isServed && r instanceof HallCallRequest && r.floor === request.floor && r.direction === request.direction
    );

    if (!alreadyQueued) {
      this.#assignedRequests.push(request);
      this.#updateDirectionIfIdle();
    }
  }

  /**
   * Door Controls
   */
  public holdDoor(): void {
    this.#door.hold();
  }

  public closeDoorImmediately(): void {
    this.#door.closeImmediately();
  }

  /**
   * Core Simulation Step: Advances elevator state machine by 1 discrete tick.
   */
  public advanceTick(): ElevatorSnapshot {
    // 1. Advance door state
    this.#door.advanceTick();

    // 2. State machine handling based on door status
    if (this.#door.getState() === 'OPENING') {
      this.#status = 'DOOR_OPENING';
      return this.getSnapshot();
    }

    if (this.#door.getState() === 'OPEN') {
      this.#status = 'DOOR_OPEN';
      // Serve any matching requests at current floor
      this.#serveFloor(this.#currentFloor);
      return this.getSnapshot();
    }

    if (this.#door.getState() === 'CLOSING') {
      this.#status = 'DOOR_CLOSING';
      return this.getSnapshot();
    }

    // Door is CLOSED, elevator can move or remain idle
    const activeStops = this.stops;
    if (activeStops.length === 0) {
      this.#direction = 'IDLE';
      this.#status = 'IDLE';
      return this.getSnapshot();
    }

    // Check if we need to open doors at the current floor
    if (this.#shouldStopAt(this.#currentFloor)) {
      this.#door.open();
      this.#status = 'DOOR_OPENING';
      return this.getSnapshot();
    }

    // Determine movement direction using LOOK/SCAN
    this.#advanceMotion();
    return this.getSnapshot();
  }

  /**
   * LOOK/SCAN directional movement algorithm.
   */
  #advanceMotion(): void {
    const activeStops = this.stops;
    if (activeStops.length === 0) {
      this.#direction = 'IDLE';
      this.#status = 'IDLE';
      return;
    }

    const stopsAbove = activeStops.filter(f => f > this.#currentFloor);
    const stopsBelow = activeStops.filter(f => f < this.#currentFloor);

    if (this.#direction === 'UP') {
      if (stopsAbove.length > 0) {
        this.#currentFloor += 1;
        this.#status = 'MOVING_UP';
      } else if (stopsBelow.length > 0) {
        // Extremum reached: reverse to DOWN
        this.#direction = 'DOWN';
        this.#currentFloor -= 1;
        this.#status = 'MOVING_DOWN';
      } else {
        this.#direction = 'IDLE';
        this.#status = 'IDLE';
      }
    } else if (this.#direction === 'DOWN') {
      if (stopsBelow.length > 0) {
        this.#currentFloor -= 1;
        this.#status = 'MOVING_DOWN';
      } else if (stopsAbove.length > 0) {
        // Extremum reached: reverse to UP
        this.#direction = 'UP';
        this.#currentFloor += 1;
        this.#status = 'MOVING_UP';
      } else {
        this.#direction = 'IDLE';
        this.#status = 'IDLE';
      }
    } else {
      // Current direction was IDLE
      const nearest = activeStops.reduce((prev, curr) => 
        Math.abs(curr - this.#currentFloor) < Math.abs(prev - this.#currentFloor) ? curr : prev
      );

      if (nearest > this.#currentFloor) {
        this.#direction = 'UP';
        this.#currentFloor += 1;
        this.#status = 'MOVING_UP';
      } else if (nearest < this.#currentFloor) {
        this.#direction = 'DOWN';
        this.#currentFloor -= 1;
        this.#status = 'MOVING_DOWN';
      } else {
        // Exactly at the stop
        this.#door.open();
        this.#status = 'DOOR_OPENING';
      }
    }

    // If arrived at a target stop after moving, check if we should immediately open doors next
    if (this.#shouldStopAt(this.#currentFloor)) {
      this.#door.open();
      this.#status = 'DOOR_OPENING';
    }
  }

  /**
   * Evaluates if the elevator should stop at the specified floor
   * according to LOOK/SCAN directional rules.
   */
  #shouldStopAt(floor: number): boolean {
    const unserved = this.#assignedRequests.filter(r => !r.isServed && r.floor === floor);
    if (unserved.length === 0) {
      return false;
    }

    // If car has a destination call (internal) for this floor, ALWAYS stop
    const hasCarCall = unserved.some(r => r instanceof CarCallRequest);
    if (hasCarCall) {
      return true;
    }

    // For external hall calls, check directional alignment
    const stopsAbove = this.stops.filter(f => f > this.#currentFloor);
    const stopsBelow = this.stops.filter(f => f < this.#currentFloor);

    const isExtremum = (this.#direction === 'UP' && stopsAbove.length === 0) ||
                      (this.#direction === 'DOWN' && stopsBelow.length === 0) ||
                      this.#direction === 'IDLE';

    return unserved.some(req => {
      if (req instanceof HallCallRequest) {
        // If at the reversal point, car can stop to reverse and pick up opposite direction
        if (isExtremum) {
          return true;
        }
        // Intermediate floor: only stop if same direction
        return req.direction === this.#direction;
      }
      return false;
    });
  }

  /**
   * Marks requests at the given floor as served and opens door.
   */
  #serveFloor(floor: number): void {
    const matchingRequests = this.#assignedRequests.filter(
      r => !r.isServed && r.matches(floor, this.#direction)
    );

    for (const req of matchingRequests) {
      req.markServed();
    }

    // Clean up served requests older than current session
    // (keep memory lean while preserving trace)
    const activeRemaining = this.#assignedRequests.filter(r => !r.isServed);
    this.#assignedRequests.length = 0;
    this.#assignedRequests.push(...activeRemaining);

    // If no more stops in current direction, check if we should reverse or become idle
    const stopsAbove = this.stops.filter(f => f > this.#currentFloor);
    const stopsBelow = this.stops.filter(f => f < this.#currentFloor);

    if (this.#direction === 'UP' && stopsAbove.length === 0) {
      this.#direction = stopsBelow.length > 0 ? 'DOWN' : 'IDLE';
    } else if (this.#direction === 'DOWN' && stopsBelow.length === 0) {
      this.#direction = stopsAbove.length > 0 ? 'UP' : 'IDLE';
    }
  }

  #updateDirectionIfIdle(): void {
    if (this.#direction === 'IDLE' && this.stops.length > 0) {
      const target = this.stops[0];
      if (target > this.#currentFloor) {
        this.#direction = 'UP';
      } else if (target < this.#currentFloor) {
        this.#direction = 'DOWN';
      }
    }
  }

  /**
   * Generates immutable telemetry snapshot for clients.
   */
  public getSnapshot(): ElevatorSnapshot {
    const carReqs = this.#assignedRequests
      .filter(r => !r.isServed && r instanceof CarCallRequest)
      .map(r => r.floor);

    return {
      id: this.#id,
      currentFloor: this.#currentFloor,
      direction: this.#direction,
      status: this.#status,
      doorState: this.#door.getState(),
      doorDwellRemaining: this.#door.getDwellRemaining(),
      assignedStops: this.stops,
      carRequests: carReqs,
      passengersCount: carReqs.length
    };
  }

  public reset(initialFloor: number = 1): void {
    this.#currentFloor = initialFloor;
    this.#direction = 'IDLE';
    this.#status = 'IDLE';
    this.#door.reset();
    this.#assignedRequests.length = 0;
  }
}
