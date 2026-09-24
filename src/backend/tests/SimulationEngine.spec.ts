import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../application/SimulationEngine';

describe('SimulationEngine Multi-Car Orchestration', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();
  });

  it('should initialize 3 elevators across 10 floors', () => {
    const snapshot = engine.getSystemSnapshot();
    expect(snapshot.elevators.length).toBe(3);
    expect(snapshot.hallCalls.length).toBe(10);
    expect(snapshot.elevators.every(e => e.currentFloor === 1)).toBe(true);
    expect(snapshot.elevators.every(e => e.status === 'IDLE')).toBe(true);
  });

  it('should register and dispatch hall call to an elevator', () => {
    engine.handleHallCall(4, 'UP');
    const snapshot = engine.getSystemSnapshot();

    // Hall call indicator should be active
    const floor4 = snapshot.hallCalls.find(h => h.floor === 4);
    expect(floor4?.upActive).toBe(true);

    // One of the elevators must have received the stop
    const assignedCar = snapshot.elevators.find(e => e.assignedStops.includes(4));
    expect(assignedCar).toBeDefined();
  });

  it('should process simulation ticks and advance elevator positions', () => {
    engine.handleHallCall(3, 'UP');

    // Advance 4 ticks
    engine.tick();
    engine.tick();
    engine.tick();
    engine.tick();

    const snapshot = engine.getSystemSnapshot();
    const movingOrServicingCar = snapshot.elevators.find(e => e.currentFloor > 1 || e.doorState !== 'CLOSED');
    expect(movingOrServicingCar).toBeDefined();
  });

  it('should reset system cleanly', () => {
    engine.handleHallCall(7, 'UP');
    engine.tick();
    engine.reset();

    const snapshot = engine.getSystemSnapshot();
    expect(snapshot.tickCount).toBe(0);
    expect(snapshot.elevators.every(e => e.currentFloor === 1)).toBe(true);
    expect(snapshot.hallCalls.every(h => !h.upActive && !h.downActive)).toBe(true);
  });

  it('should cancel car destination on second call (double-click toggle)', () => {
    // 1st click: selects floor 6
    engine.handleCarCall('1', 6);
    let snapshot = engine.getSystemSnapshot();
    let car1 = snapshot.elevators.find(e => e.id === '1');
    expect(car1?.carRequests).toContain(6);

    // 2nd click: cancels floor 6
    engine.handleCarCall('1', 6);
    snapshot = engine.getSystemSnapshot();
    car1 = snapshot.elevators.find(e => e.id === '1');
    expect(car1?.carRequests).not.toContain(6);
  });

  it('should cancel hall call on second call (double-click toggle)', () => {
    // 1st click: calls Floor 5 UP
    engine.handleHallCall(5, 'UP');
    let snapshot = engine.getSystemSnapshot();
    let floor5 = snapshot.hallCalls.find(h => h.floor === 5);
    expect(floor5?.upActive).toBe(true);
    expect(snapshot.elevators.some(e => e.assignedStops.includes(5))).toBe(true);

    // 2nd click: cancels Floor 5 UP
    engine.handleHallCall(5, 'UP');
    snapshot = engine.getSystemSnapshot();
    floor5 = snapshot.hallCalls.find(h => h.floor === 5);
    expect(floor5?.upActive).toBe(false);
    expect(snapshot.elevators.some(e => e.assignedStops.includes(5))).toBe(false);
  });
});
