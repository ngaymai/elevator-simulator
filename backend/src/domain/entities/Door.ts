import { DoorState } from '@elevator-sim/shared';

/**
 * Encapsulated Door subsystem with state-driven transitions and dwell timing.
 */
export class Door {
  #state: DoorState = 'CLOSED';
  #dwellTicksRemaining: number = 0;
  #defaultDwellTicks: number;

  constructor(defaultDwellTicks: number = 2) {
    this.#defaultDwellTicks = Math.max(1, defaultDwellTicks);
  }

  public getState(): DoorState {
    return this.#state;
  }

  public getDwellRemaining(): number {
    return this.#dwellTicksRemaining;
  }

  public isClosed(): boolean {
    return this.#state === 'CLOSED';
  }

  public isOpen(): boolean {
    return this.#state === 'OPEN';
  }

  /**
   * Initiates door opening sequence.
   */
  public open(): void {
    if (this.#state === 'CLOSED' || this.#state === 'CLOSING') {
      this.#state = 'OPENING';
      this.#dwellTicksRemaining = 1; // 1 tick to open
    }
  }

  /**
   * Hold door open (<|> button): resets dwell timer to full duration.
   */
  public hold(): void {
    if (this.#state === 'OPEN' || this.#state === 'OPENING') {
      this.#state = 'OPEN';
      this.#dwellTicksRemaining = this.#defaultDwellTicks;
    }
  }

  /**
   * Close door immediately (>|< button): forces door into closing phase immediately.
   */
  public closeImmediately(): void {
    if (this.#state === 'OPEN' || this.#state === 'OPENING') {
      this.#state = 'CLOSING';
      this.#dwellTicksRemaining = 0;
    }
  }

  /**
   * Advances the door's internal clock by one discrete tick.
   */
  public advanceTick(): void {
    switch (this.#state) {
      case 'OPENING':
        this.#state = 'OPEN';
        this.#dwellTicksRemaining = this.#defaultDwellTicks;
        break;

      case 'OPEN':
        if (this.#dwellTicksRemaining > 0) {
          this.#dwellTicksRemaining -= 1;
        }
        if (this.#dwellTicksRemaining === 0) {
          this.#state = 'CLOSING';
        }
        break;

      case 'CLOSING':
        this.#state = 'CLOSED';
        break;

      case 'CLOSED':
      default:
        // Already closed, stationary
        break;
    }
  }

  public reset(): void {
    this.#state = 'CLOSED';
    this.#dwellTicksRemaining = 0;
  }
}
