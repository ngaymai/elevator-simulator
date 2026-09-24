# System Architecture: Autonomous Elevator Simulator

## 1. Executive Summary & Architectural Overview

The Autonomous Elevator Simulator is an enterprise-grade, event-driven web application designed to simulate and optimize 3 parallel elevator cars servicing a 10-floor office building. The system is engineered around strict Object-Oriented Programming (OOP) paradigms—featuring robust encapsulation, class inheritance hierarchies, and polymorphic strategy patterns.

Real-time bi-directional telemetry connects the Node.js simulation engine to a responsive React.js visualization layer via WebSocket streams.

```mermaid
graph TB
    subgraph Client ["Frontend (React.js + Tailwind CSS)"]
        UI["UI Viewport (10 Floors x 3 Shafts)"]
        HallCtrl["Hall Call Controls (UP/DOWN)"]
        CabinCtrl["Cabin Controls (1-10, Door Hold/Close)"]
        MetricsView["Real-time Telemetry & Metrics"]
        WSClient["WebSocket Client Manager"]
        
        UI --> HallCtrl
        UI --> CabinCtrl
        UI --> MetricsView
        HallCtrl --> WSClient
        CabinCtrl --> WSClient
    end

    subgraph Server ["Backend (Node.js + TypeScript Engine)"]
        WSServer["WebSocket Gateway / Controller"]
        SimClock["Simulation Clock (Ticking Engine)"]
        Orchestrator["Elevator System Orchestrator"]
        
        subgraph DomainModel ["Pure OOP Domain Layer"]
            Dispatcher["Polymorphic Dispatcher (IElevatorDispatcher)"]
            CarA["Elevator Car A"]
            CarB["Elevator Car B"]
            CarC["Elevator Car C"]
            DoorComponent["Door Subsystem (State Pattern)"]
            MotorComponent["Motor Subsystem"]
        end
        
        WSServer <--> Orchestrator
        SimClock --> Orchestrator
        Orchestrator --> Dispatcher
        Dispatcher --> CarA
        Dispatcher --> CarB
        Dispatcher --> CarC
        CarA --> DoorComponent
        CarA --> MotorComponent
    end

    WSClient <==>|"Bi-directional WebSocket (Events / Telemetry)"| WSServer
```

---

## 2. Object-Oriented Domain Hierarchy & Polymorphism

The domain layer enforces clean separation of concerns, strict state encapsulation, and polymorphic extensibility:

```mermaid
classDiagram
    class ElevatorRequest {
        <<abstract>>
        +id: string
        +floor: number
        +timestamp: number
        +isServed: boolean
        +markServed() void
        +matches(currentFloor: number, direction: Direction)* boolean
    }
    
    class HallCallRequest {
        +direction: Direction
        +matches(currentFloor: number, direction: Direction) boolean
    }
    
    class CarCallRequest {
        +carId: string
        +matches(currentFloor: number, direction: Direction) boolean
    }
    
    ElevatorRequest <|-- HallCallRequest : Inheritance
    ElevatorRequest <|-- CarCallRequest : Inheritance

    class IElevatorDispatcher {
        <<interface>>
        +selectBestElevator(elevators: Elevator[], request: HallCallRequest) Elevator
    }
    
    class ETADispatcher {
        -calculateETA(elevator: Elevator, request: HallCallRequest) number
        +selectBestElevator(elevators: Elevator[], request: HallCallRequest) Elevator
    }
    
    class NearestCarDispatcher {
        -calculateDistance(elevator: Elevator, request: HallCallRequest) number
        +selectBestElevator(elevators: Elevator[], request: HallCallRequest) Elevator
    }

    IElevatorDispatcher <|.. ETADispatcher : Polymorphic Realization
    IElevatorDispatcher <|.. NearestCarDispatcher : Polymorphic Realization

    class Elevator {
        -id: string
        -currentFloor: number
        -currentDirection: Direction
        -state: ElevatorState
        -door: Door
        -stops: Set~number~
        -pendingRequests: ElevatorRequest[]
        +addDestination(floor: number) void
        +assignHallCall(request: HallCallRequest) void
        +advanceTick() ElevatorSnapshot
        +holdDoor() void
        +closeDoorImmediately() void
        +getSnapshot() ElevatorSnapshot
    }

    class Door {
        -state: DoorState
        -dwellTicksRemaining: number
        +open() void
        +close() void
        +hold() void
        +closeImmediately() void
        +advanceTick() DoorState
    }

    Elevator *-- Door : Encapsulation / Composition
```

---

## 3. Elevator Finite State Machine (FSM)

The elevator operates via a deterministic state machine ensuring physical safety constraints (e.g., doors cannot open while moving; motor cannot engage while doors are open):

```mermaid
stateDiagram-v2
    [*] --> IDLE : System Initialization
    
    IDLE --> MOVING_UP : Target > Current Floor
    IDLE --> MOVING_DOWN : Target < Current Floor
    IDLE --> DOOR_OPENING : Target == Current Floor
    
    state MOVING_UP {
        [*] --> InTransitUp
        InTransitUp --> CheckStopAtFloor : Reach Floor
        CheckStopAtFloor --> InTransitUp : No Stop Required
    }
    
    state MOVING_DOWN {
        [*] --> InTransitDown
        InTransitDown --> CheckStopAtFloorDown : Reach Floor
        CheckStopAtFloorDown --> InTransitDown : No Stop Required
    }

    MOVING_UP --> DOOR_OPENING : Arrived at Scheduled Stop
    MOVING_DOWN --> DOOR_OPENING : Arrived at Scheduled Stop

    DOOR_OPENING --> DOOR_OPEN : Door Transition Complete
    
    state DOOR_OPEN {
        [*] --> CountingDwellTicks
        CountingDwellTicks --> CountingDwellTicks : Press Hold Button (Hold)
        CountingDwellTicks --> DOOR_CLOSING : Dwell Expired OR Press Close (Close)
    }

    DOOR_CLOSING --> DOOR_OPENING : Obstruction / Re-open
    DOOR_CLOSING --> IDLE : Doors Closed & Queue Empty
    DOOR_CLOSING --> MOVING_UP : Doors Closed & Higher Targets Pending
    DOOR_CLOSING --> MOVING_DOWN : Doors Closed & Lower Targets Pending
```

---

## 4. End-to-End Event Sequence: SCAN/LOOK Dispatching Flow

The sequence below illustrates the exact behavior of the LOOK/SCAN dispatching logic:
1. Elevator A is moving UP from Floor 1 to Floor 10.
2. Passenger at Floor 5 presses UP $\rightarrow$ Elevator A stops at Floor 5 to pick up passenger.
3. Passenger at Floor 5 presses DOWN $\rightarrow$ Elevator A does **NOT** stop at Floor 5 on the way up; it serves the call after completing its upward trajectory and switching direction.

```mermaid
sequenceDiagram
    autonumber
    actor UserUp as Passenger (Floor 5 UP)
    actor UserDown as Passenger (Floor 5 DOWN)
    participant UI as React Visualizer
    participant WS as WebSocket Gateway
    participant Disp as Dispatcher (ETA Strategy)
    participant CarA as Elevator A (At Floor 2, Moving UP)

    Note over CarA: Elevator A is traveling UP towards Floor 10

    UserUp ->> UI: Clicks UP button at Floor 5
    UI ->> WS: emit("hall_call", { floor: 5, direction: "UP" })
    WS ->> Disp: dispatch(HallCall(5, UP))
    Disp ->> CarA: evaluateETA() : Lowest cost (On path, same direction)
    Disp ->> CarA: scheduleStop(5)
    Note over CarA: Floor 5 added to UP stop list

    UserDown ->> UI: Clicks DOWN button at Floor 5
    UI ->> WS: emit("hall_call", { floor: 5, direction: "DOWN" })
    WS ->> Disp: dispatch(HallCall(5, DOWN))
    Note over Disp, CarA: CarA is going UP -- cannot pick up DOWN passenger yet!
    Disp ->> CarA: scheduleReturnStop(5, DOWN) (Queue for downward pass)

    CarA ->> CarA: Advances to Floor 5 (direction: UP)
    Note over CarA: Direction matches UP request!
    CarA ->> UI: emit("elevator_state", { floor: 5, door: "OPENING", direction: "UP" })
    Note over UserUp: Boarding permitted, Floor 5 UP light clears

    UserUp ->> UI: Inside Cabin, clicks Floor 8
    UI ->> WS: emit("car_call", { carId: "A", floor: 8 })
    WS ->> CarA: scheduleStop(8)

    CarA ->> CarA: Closes doors, moves towards Floor 10
    Note over CarA: Reaches extremum Floor 10, completes UP queue
    CarA ->> CarA: Reverses direction to DOWN
    CarA ->> CarA: Advances down towards Floor 5
    CarA ->> UI: emit("elevator_state", { floor: 5, door: "OPENING", direction: "DOWN" })
    Note over UserDown: Boarding permitted, Floor 5 DOWN light clears
```
