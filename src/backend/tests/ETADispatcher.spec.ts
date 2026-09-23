import { describe, it, expect, beforeEach } from 'vitest';
import { Elevator } from '../domain/entities/Elevator';
import { ETADispatcher } from '../domain/dispatchers/ETADispatcher';
import { HallCallRequest } from '../domain/entities/ElevatorRequest';

describe('ETADispatcher Algorithm & Polymorphic Selection', () => {
  let dispatcher: ETADispatcher;
  let car1: Elevator;
  let car2: Elevator;
  let car3: Elevator;

  beforeEach(() => {
    dispatcher = new ETADispatcher(1.0, 2.0);
    car1 = new Elevator('1', 1);
    car2 = new Elevator('2', 5);
    car3 = new Elevator('3', 10);
  });

  it('should select closest idle car for a simple hall call', () => {
    // Request at Floor 6 UP
    const req = new HallCallRequest(6, 'UP');
    const selected = dispatcher.selectElevator([car1, car2, car3], req);

    // Car 2 is at Floor 5 (distance 1), Car 1 is at 1 (distance 5), Car 3 is at 10 (distance 4)
    expect(selected.id).toBe('2');
  });

  it('should prefer a car already traveling in the same direction over a car moving away', () => {
    // Car 1 at Floor 3 moving UP to Floor 8
    car1.addDestination(8);
    car1.advanceTick(); // now at floor 4 moving UP

    // Car 2 at Floor 6 moving DOWN to Floor 1
    car2.addDestination(1);
    car2.advanceTick(); // now at floor 5 moving DOWN

    // Passenger at Floor 6 requests UP
    const req = new HallCallRequest(6, 'UP');
    const selected = dispatcher.selectElevator([car1, car2], req);

    // Car 1 is moving UP towards 6, so it can pick up directly
    // Car 2 is moving DOWN away from 6, so ETA is much worse
    expect(selected.id).toBe('1');
  });
});
