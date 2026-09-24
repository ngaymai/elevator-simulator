# Enterprise Multi-Car Elevator Supervisory & Dispatch System (10 Floors &times; 3 Cars)

An enterprise-grade, event-driven elevator simulator and traffic supervisory web application built with **Node.js** (backend) and **React.js** (frontend). The system simulates and optimizes 3 parallel elevators servicing a 10-floor office building adhering strictly to **Object-Oriented Programming (OOP)** paradigms and the **LOOK/SCAN directional dispatching algorithm**.

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
- **Automated Verification**:
  - 100% test coverage verifying directional LOOK/SCAN constraints via Vitest (`npm test`).

---

## System Architecture & Technical Documentation

All detailed architectural documentation includes interactive **Mermaid diagrams**:
- [Architecture & Domain Model](docs/ARCHITECTURE.md) - Class hierarchy, State Machine, C4 Container diagram, and dispatching sequence.

---

## Project Structure

All source code is cleanly consolidated under `/src`:

```text
elevator-simulator/
├── package.json                   # Single unified package.json for entire project
├── tsconfig.json                  # Root TypeScript compiler options
├── tsconfig.server.json           # Server build config
├── vite.config.ts                 # Vite bundler & Vitest test runner configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS plugins
├── index.html                     # Entry HTML pointing to /src/frontend/main.tsx
├── docs/                          # Architectural specifications
│   └── ARCHITECTURE.md
└── src/                           # ALL APPLICATION SOURCE CODE
    ├── shared/                    # Types, Enums, Contracts, Constants
    │   └── index.ts
    ├── backend/                   # Node.js + WebSocket Server
    │   ├── domain/                # Pure OOP Domain layer (Door, Elevator, Request, Dispatchers)
    │   ├── application/           # Simulation clock & multi-car orchestrator
    │   ├── infrastructure/        # WebSocket server & REST health endpoints
    │   ├── tests/                 # Vitest unit & integration test suites
    │   └── index.ts               # Server entrypoint (Port 4000)
    └── frontend/                  # React.js + Tailwind CSS Visualizer
        ├── components/            # VisualShafts, FloorLobby, Header
        ├── hooks/                 # useElevatorSocket hook
        ├── App.tsx
        ├── main.tsx
        └── index.css
```

---

## Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### 1. Installation
Install all dependencies in one command:
```bash
npm install
```

### 2. Running the Application Locally
Run both Backend (Port 4000) and Frontend (Port 3000) concurrently:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

*(Optional)* You can also run them separately:
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

### 3. Running the Test Suite
Run all unit and integration tests:
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## Git Conventions & Commit History
Commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat(domain): ...`
- `feat(dispatcher): ...`
- `test(elevator): ...`
- `docs(architecture): ...`
