import { Elevator } from '../entities/Elevator';
import { HallCallRequest } from '../entities/ElevatorRequest';
import { IElevatorDispatcher } from './IElevatorDispatcher';

/**
 * Advanced Estimated Time of Arrival (ETA) Dispatcher.
 * Computes exact estimated arrival costs taking into account motion vectors,
 * intermediate stops, dwell times, and turn-around penalties.
 */
export class ETADispatcher implements IElevatorDispatcher {
  readonly #transitTimeSec: number;
  readonly #dwellTimeSec: number;

  constructor(transitTimeSec: number = 1.0, dwellTimeSec: number = 2.0) {
    this.#transitTimeSec = transitTimeSec;
    this.#dwellTimeSec = dwellTimeSec;
  }

  public selectElevator(elevators: readonly Elevator[], request: HallCallRequest): Elevator {
    if (elevators.length === 0) {
      throw new Error('No elevators available in system.');
    }

    let bestElevator = elevators[0];
    let minCost = Infinity;

    for (const elevator of elevators) {
      const cost = this.calculateCost(elevator, request);
      if (cost < minCost) {
        minCost = cost;
        bestElevator = elevator;
      }
    }

    return bestElevator;
  }

  /**
   * Computes the dynamic ETA cost for a candidate elevator.
   */
  public calculateCost(elevator: Elevator, request: HallCallRequest): number {
    const currentFloor = elevator.currentFloor;
    const reqFloor = request.floor;
    const reqDir = request.direction;
    const carDir = elevator.direction;
    const stops = elevator.stops;

    // Case 1: Elevator is IDLE
    if (carDir === 'IDLE' || stops.length === 0) {
      return Math.abs(currentFloor - reqFloor) * this.#transitTimeSec;
    }

    // Case 2: Elevator is moving UP
    if (carDir === 'UP') {
      const maxStop = Math.max(...stops, currentFloor);

      if (reqFloor >= currentFloor && reqDir === 'UP') {
        // Direct on-path pickup
        const intermediateStops = stops.filter(s => s >= currentFloor && s <= reqFloor).length;
        return (reqFloor - currentFloor) * this.#transitTimeSec + intermediateStops * this.#dwellTimeSec;
      }

      // Opposite direction or already passed: must reach max stop, then reverse
      const distanceToMax = maxStop - currentFloor;
      const distanceFromMaxToReq = Math.abs(maxStop - reqFloor);
      const allStopsDwell = stops.length * this.#dwellTimeSec;
      const turnAroundPenalty = 3.0; // Penalty to encourage idle car selection

      return (distanceToMax + distanceFromMaxToReq) * this.#transitTimeSec + allStopsDwell + turnAroundPenalty;
    }

    // Case 3: Elevator is moving DOWN
    if (carDir === 'DOWN') {
      const minStop = Math.min(...stops, currentFloor);

      if (reqFloor <= currentFloor && reqDir === 'DOWN') {
        // Direct on-path pickup
        const intermediateStops = stops.filter(s => s <= currentFloor && s >= reqFloor).length;
        return (currentFloor - reqFloor) * this.#transitTimeSec + intermediateStops * this.#dwellTimeSec;
      }

      // Opposite direction or already passed: must reach min stop, then reverse
      const distanceToMin = currentFloor - minStop;
      const distanceFromMinToReq = Math.abs(reqFloor - minStop);
      const allStopsDwell = stops.length * this.#dwellTimeSec;
      const turnAroundPenalty = 3.0;

      return (distanceToMin + distanceFromMinToReq) * this.#transitTimeSec + allStopsDwell + turnAroundPenalty;
    }

    return 100.0;
  }
}
