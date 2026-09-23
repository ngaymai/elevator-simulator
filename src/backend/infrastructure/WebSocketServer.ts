import http from 'http';
import express, { Express } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { 
  CarCallPayload, 
  DoorControlPayload, 
  HallCallPayload, 
  WS_EVENTS 
} from '@shared';
import { SimulationEngine } from '../application/SimulationEngine';

export class WebSocketServer {
  readonly #app: Express;
  readonly #httpServer: http.Server;
  readonly #io: SocketIOServer;
  readonly #engine: SimulationEngine;
  readonly #port: number;

  constructor(engine: SimulationEngine, port: number = 4000) {
    this.#engine = engine;
    this.#port = port;
    this.#app = express();
    this.#httpServer = http.createServer(this.#app);

    this.#io = new SocketIOServer(this.#httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.#setupRoutes();
    this.#setupSockets();

    // Hook simulation engine tick updates to broadcast via WebSocket
    this.#engine.setSnapshotCallback((snapshot) => {
      this.#io.emit(WS_EVENTS.STATE_UPDATE, snapshot);
    });
  }

  #setupRoutes(): void {
    this.#app.use(express.json());

    this.#app.get('/', (_req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Elevator Simulator Backend API</title>
          <meta http-equiv="refresh" content="2;url=http://localhost:3000" />
          <style>
            body { font-family: system-ui, sans-serif; background: #020617; color: #f8fafc; padding: 40px; text-align: center; }
            .card { max-width: 500px; margin: 40px auto; background: #0f172a; padding: 32px; border-radius: 12px; border: 1px solid #1e293b; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            .btn { display: inline-block; background: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; transition: background 0.2s; }
            .btn:hover { background: #be123c; }
            .sub { color: #94a3b8; font-size: 13px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Elevator Simulator Backend (Port 4000)</h2>
            <p style="color: #38bdf8;">WebSocket & REST API Server is running.</p>
            <p>To view the interactive simulation UI, open the Frontend:</p>
            <a href="http://localhost:3000" class="btn">Open Web Application &rarr;</a>
            <p class="sub">Auto-redirecting to http://localhost:3000 in 2 seconds...</p>
          </div>
        </body>
        </html>
      `);
    });

    this.#app.get('/health', (_req, res) => {
      res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        engineStatus: 'RUNNING'
      });
    });

    this.#app.get('/api/state', (_req, res) => {
      res.json(this.#engine.getSystemSnapshot());
    });
  }

  #setupSockets(): void {
    this.#io.on('connection', (socket) => {
      // Send immediate initial snapshot upon connection
      socket.emit(WS_EVENTS.STATE_UPDATE, this.#engine.getSystemSnapshot());

      socket.on(WS_EVENTS.HALL_CALL, (payload: HallCallPayload) => {
        if (payload && typeof payload.floor === 'number' && (payload.direction === 'UP' || payload.direction === 'DOWN')) {
          this.#engine.handleHallCall(payload.floor, payload.direction);
        }
      });

      socket.on(WS_EVENTS.CAR_CALL, (payload: CarCallPayload) => {
        if (payload && typeof payload.carId === 'string' && typeof payload.floor === 'number') {
          this.#engine.handleCarCall(payload.carId, payload.floor);
        }
      });

      socket.on(WS_EVENTS.DOOR_CONTROL, (payload: DoorControlPayload) => {
        if (payload && payload.carId && (payload.action === 'HOLD' || payload.action === 'CLOSE_IMMEDIATELY')) {
          this.#engine.handleDoorControl(payload);
        }
      });

      socket.on(WS_EVENTS.SET_SPEED, (speed: number) => {
        if (typeof speed === 'number' && speed > 0) {
          this.#engine.setSpeed(speed);
        }
      });

      socket.on(WS_EVENTS.RESET, () => {
        this.#engine.reset();
      });
    });
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.#httpServer.listen(this.#port, () => {
        console.log(`[ElevatorSim Server] Running at http://localhost:${this.#port}`);
        console.log(`[ElevatorSim Server] Real-time WebSocket gateway listening on port ${this.#port}`);
        this.#engine.start();
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      this.#engine.stop();
      this.#io.close();
      this.#httpServer.close(() => resolve());
    });
  }
}
