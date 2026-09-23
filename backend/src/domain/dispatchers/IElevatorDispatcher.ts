import { Elevator } from '../entities/Elevator';
import { HallCallRequest } from '../entities/ElevatorRequest';

/**
 * Strategy interface for polymorphic elevator dispatching.
 * Allows interchangeable scheduling algorithms (ETA, Nearest Car, Energy-Optimized).
 */
export interface IElevatorDispatcher {
  /**
   * Evaluates available elevators and returns the optimal car for the incoming request.
   */
  selectElevator(elevators: readonly Elevator[], request: HallCallRequest): Elevator;
}
