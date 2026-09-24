import { describe, it, expect, beforeEach } from 'vitest';
import { Elevator } from '../domain/entities/Elevator';
import { HallCallRequest } from '../domain/entities/ElevatorRequest';

describe('Elevator Domain Entity & LOOK/SCAN Logic', () => {
  let elevator: Elevator;

  beforeEach(() => {
    // Elevator '1' starting at Floor 1, dwell ticks = 2
    elevator = new Elevator('1', 1, 2);
  });

  it('should initialize at Floor 1 in IDLE state with closed doors', () => {
    const snapshot = elevator.getSnapshot();
    expect(snapshot.id).toBe('1');
    expect(snapshot.currentFloor).toBe(1);
    expect(snapshot.direction).toBe('IDLE');
    expect(snapshot.status).toBe('IDLE');
    expect(snapshot.doorState).toBe('CLOSED');
    expect(snapshot.assignedStops).toEqual([]);
  });

  it('should open door when a destination call is made for current floor', () => {
    elevator.addDestination(1);
    elevator.advanceTick(); // transitions from CLOSED -> OPENING
    expect(elevator.doorState).toBe('OPENING');
    expect(elevator.status).toBe('DOOR_OPENING');

    elevator.advanceTick(); // transitions from OPENING -> OPEN
    expect(elevator.doorState).toBe('OPEN');
    expect(elevator.status).toBe('DOOR_OPEN');
  });

  it('should handle door hold (<|>) by resetting dwell timer', () => {
    elevator.addDestination(1);
    elevator.advanceTick(); // OPENING
    elevator.advanceTick(); // OPEN, dwell = 2
    expect(elevator.doorState).toBe('OPEN');

    elevator.advanceTick(); // dwell = 1
    expect(elevator.doorState).toBe('OPEN');

    elevator.holdDoor(); // resets dwell = 2
    elevator.advanceTick(); // dwell = 1
    expect(elevator.doorState).toBe('OPEN');
  });

  it('should handle immediate door close (>|<)', () => {
    elevator.addDestination(1);
    elevator.advanceTick(); // OPENING
    elevator.advanceTick(); // OPEN
    expect(elevator.doorState).toBe('OPEN');

    elevator.closeDoorImmediately();
    expect(elevator.doorState).toBe('CLOSING');

    elevator.advanceTick();
    expect(elevator.doorState).toBe('CLOSED');
  });

  it('strictly satisfies interview requirement: UP elevator stops for UP hall call but ignores DOWN hall call until reversal', () => {
    // Car at Floor 1 with passenger going to Floor 10
    elevator.addDestination(10);
    
    // Call 1: Passenger at Floor 5 wants to go UP
    elevator.assignHallCall(new HallCallRequest(5, 'UP'));

    // Call 2: Passenger at Floor 5 wants to go DOWN
    const downCall = new HallCallRequest(5, 'DOWN');
    elevator.assignHallCall(downCall);

    // Car starts moving up
    // From floor 1 to 5:
    while (elevator.currentFloor < 5) {
      elevator.advanceTick();
    }

    expect(elevator.currentFloor).toBe(5);
    // Door opening sequence triggered at floor 5 for the UP passenger
    expect(['OPENING', 'OPEN']).toContain(elevator.doorState);
    if (elevator.doorState === 'OPENING') {
      elevator.advanceTick();
    }
    expect(elevator.doorState).toBe('OPEN');
    
    // Advance through door open dwell until doors close
    while (elevator.doorState !== 'CLOSED') {
      elevator.advanceTick();
    }

    // Now moving up towards 10
    expect(elevator.direction).toBe('UP');
    while (elevator.currentFloor < 10) {
      elevator.advanceTick();
    }
    expect(elevator.currentFloor).toBe(10);
    
    // Arrived at 10, door opens
    if (elevator.doorState === 'OPENING') {
      elevator.advanceTick();
    }
    expect(elevator.doorState).toBe('OPEN');

    // Down call at Floor 5 MUST NOT have been served yet!
    expect(downCall.isServed).toBe(false);

    // Doors close at 10
    while (elevator.doorState !== 'CLOSED') {
      elevator.advanceTick();
    }

    // Now extremum 10 is served, car must reverse to DOWN to pick up Floor 5 DOWN!
    expect(elevator.direction).toBe('DOWN');

    while (elevator.currentFloor > 5) {
      elevator.advanceTick();
    }

    expect(elevator.currentFloor).toBe(5);
    if (elevator.doorState === 'OPENING') {
      elevator.advanceTick();
    }
    // Doors open on the downward run!
    expect(elevator.doorState).toBe('OPEN');
    expect(downCall.isServed).toBe(true);
  });

  it('should support destination cancellation and recalculate direction', () => {
    elevator.addDestination(6);
    elevator.addDestination(8);
    expect(elevator.stops).toEqual([6, 8]);
    expect(elevator.direction).toBe('UP');

    // Remove floor 8
    const removed8 = elevator.removeDestination(8);
    expect(removed8).toBe(true);
    expect(elevator.stops).toEqual([6]);
    expect(elevator.direction).toBe('UP');

    // Remove floor 6
    const removed6 = elevator.removeDestination(6);
    expect(removed6).toBe(true);
    expect(elevator.stops).toEqual([]);
    expect(elevator.direction).toBe('IDLE');
  });

  it('should support hall call cancellation and recalculate direction', () => {
    const hallCall = new HallCallRequest(7, 'UP');
    elevator.assignHallCall(hallCall);
    expect(elevator.stops).toEqual([7]);
    expect(elevator.direction).toBe('UP');

    const removed = elevator.removeHallCall(7, 'UP');
    expect(removed).toBe(true);
    expect(elevator.stops).toEqual([]);
    expect(elevator.direction).toBe('IDLE');
  });
});
