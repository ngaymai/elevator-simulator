import { Elevator } from '../entities/Elevator';
import { HallCallRequest } from '../entities/ElevatorRequest';
import { IElevatorDispatcher } from './IElevatorDispatcher';

/**
 * Baseline Nearest Car (NC) Dispatcher.
 * Simplistic dispatching based solely on geometric distance to illustrate polymorphism.
 */
export class NearestCarDispatcher implements IElevatorDispatcher {
  public selectElevator(elevators: readonly Elevator[], request: HallCallRequest): Elevator {
    if (elevators.length === 0) {
      throw new Error('No elevators available in system.');
    }

    let nearest = elevators[0];
    let minDistance = Infinity;

    for (const car of elevators) {
      const distance = Math.abs(car.currentFloor - request.floor);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = car;
      }
    }

    return nearest;
  }
}
