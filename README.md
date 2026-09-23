# Enterprise Multi-Car Elevator Simulator (10 Floors &times; 3 Cars)

An enterprise-grade, event-driven elevator simulator web application built with **Node.js** (backend) and **React.js** (frontend). The system simulates and optimizes 3 parallel elevators servicing a 10-floor office building adhering strictly to **Object-Oriented Programming (OOP)** paradigms and the **LOOK/SCAN directional dispatching algorithm**.

Developed to meet and exceed the requirements in `Requirements/BAT-Node.js - Interview Test-231224-052639.pdf`.

---

## Key Features

- **Strict LOOK/SCAN Directional Discipline**:
  - An elevator moving UP only stops at intermediate floors for passengers wanting to go UP, or for internal destination drop-offs.
  - Passengers wanting to go DOWN will not interrupt an ongoing upward run; the car completes its trajectory to the extremum, reverses direction, and picks them up on the return leg.
- **Pure Object-Oriented Architecture (OOP)**:
  - **Encapsulation**: Private state fields in `Elevator` and `Door` prevent illegal state mutations. Transitions occur solely via deterministic methods.
  - **Inheritance**: Abstract base class `ElevatorRequest` specialized into `HallCallRequest` (directional) and `CarCallRequest` (cabin-internal).
  - **Polymorphism**: The `IElevatorDispatcher` interface enables interchangeable scheduling strategies (`ETADispatcher` with LOOK cost calculation vs. `NearestCarDispatcher`).
- **Door Dwell & Safety Controls**:
  - Configurable dwell timer upon floor arrival.
  - `<|>` Hold button resets dwell timer to keep doors open.
  - `>|<` Close button forces doors to close immediately without delay.
- **Real-time Bi-directional Streaming**:
  - Synchronized state streaming via WebSocket (`socket.io`).
  - Speed toggle (1x, 2x, 5x) for rapid simulation testing and interactive presentation.
  - One-click **Automated Interview Test Case Demonstrator** directly on the UI.

---

## System Architecture & Technical Documentation

All detailed architectural documentation includes **Mermaid diagrams**:
- [Architecture & Domain Model](docs/ARCHITECTURE.md) - Class hierarchy, State Machine, C4 Container diagram.
- [ADR-001: Multi-Car Dispatching Strategy](docs/ADR-001-DISPATCHER.md) - Justification and mathematical model of the ETA Cost Function.
- [Interview Presentation Strategy (45 Minutes)](docs/INTERVIEW_STRATEGY.md) - Section-by-section presentation breakdown for the technical interview.
- [Bounded Adversarial Review](docs/ADVERSARIAL_REVIEW.md) - Red Team vs. Blue Team stress tests and mitigations.

---

## Project Structure (Monorepo)

```text
TheChadDigital/
├── package.json                   # Monorepo workspaces config (npm workspaces)
├── tsconfig.base.json             # Root TypeScript compiler options
├── TASK_LIST.md                   # Real-time task progress tracker
├── Requirements/                  # Original test problem specification
├── docs/                          # Architectural specs, ADRs, and presentation guides
│   ├── ARCHITECTURE.md
│   ├── ADR-001-DISPATCHER.md
│   ├── INTERVIEW_STRATEGY.md
│   └── ADVERSARIAL_REVIEW.md
├── shared/                        # Shared contracts, DTOs, and event signatures
│   └── src/index.ts
├── backend/                       # Node.js + TypeScript simulation engine
│   ├── src/domain/                # Pure OOP Domain layer (Door, Elevator, Request, Dispatchers)
│   ├── src/application/           # Simulation clock & multi-car orchestrator
│   ├── src/infrastructure/        # WebSocket server & REST health endpoints
│   └── tests/                     # Vitest unit & integration test suites
└── frontend/                      # React.js + Vite + Tailwind CSS visualizer
    └── src/
        ├── components/            # ElevatorShaft, CabinControls, Header, ScenarioRunner
        └── hooks/                 # useElevatorSocket hook
```

---

## Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### 1. Installation
Install all dependencies across the monorepo:
```bash
npm install
```

### 2. Build All Packages
```bash
npm run build:shared
npm run build:backend
npm run build:frontend
```

### 3. Running the Test Suite
Run all unit and integration tests:
```bash
npm run test
```

### 4. Running the Application Locally
To run both backend and frontend concurrently:
```bash
# Terminal 1: Start Backend (Port 4000)
npm run dev:backend

# Terminal 2: Start Frontend (Port 3000)
npm run dev:frontend
```
Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the elevator simulation.

---

## Git Conventions & Commit History
Commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat(domain): ...`
- `feat(dispatcher): ...`
- `test(elevator): ...`
- `docs(architecture): ...`
