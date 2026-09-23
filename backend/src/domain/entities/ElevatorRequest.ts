import { Direction, RequestType } from '@elevator-sim/shared';

/**
 * Abstract base class representing any request in the elevator system.
 * Demonstrates OOP Inheritance and Polymorphic behavior.
 */
export abstract class ElevatorRequest {
  public readonly id: string;
  public readonly floor: number;
  public readonly timestamp: number;
  private _isServed: boolean = false;

  constructor(floor: number) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.floor = floor;
    this.timestamp = Date.now();
  }

  public get isServed(): boolean {
    return this._isServed;
  }

  public markServed(): void {
    this._isServed = true;
  }

  /**
   * Polymorphic method to determine whether this request should cause
   * the elevator to stop at current floor given the current direction of motion.
   */
  public abstract matches(currentFloor: number, direction: Direction): boolean;

  public abstract getType(): RequestType;
}

/**
 * Hall Call: Passenger at a floor requesting an elevator to travel UP or DOWN.
 */
export class HallCallRequest extends ElevatorRequest {
  public readonly direction: 'UP' | 'DOWN';

  constructor(floor: number, direction: 'UP' | 'DOWN') {
    super(floor);
    this.direction = direction;
  }

  public override matches(currentFloor: number, direction: Direction): boolean {
    if (this.floor !== currentFloor) {
      return false;
    }
    // Stops if direction matches or car is IDLE
    return direction === 'IDLE' || direction === this.direction;
  }

  public override getType(): RequestType {
    return 'HALL_CALL';
  }
}

/**
 * Car Call: Passenger inside the elevator cabin pressing a destination floor.
 */
export class CarCallRequest extends ElevatorRequest {
  public readonly carId: string;

  constructor(carId: string, destinationFloor: number) {
    super(destinationFloor);
    this.carId = carId;
  }

  public override matches(currentFloor: number, _direction: Direction): boolean {
    // Passenger inside car must be dropped off at their target floor regardless of motion direction
    return this.floor === currentFloor;
  }

  public override getType(): RequestType {
    return 'CAR_CALL';
  }
}
