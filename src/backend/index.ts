import { SimulationEngine } from './application/SimulationEngine';
import { WebSocketServer } from './infrastructure/WebSocketServer';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

async function bootstrap() {
  const engine = new SimulationEngine();
  const server = new WebSocketServer(engine, PORT);

  await server.start();

  const shutdown = async () => {
    console.log('\n[ElevatorSim Server] Gracefully shutting down...');
    await server.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  console.error('[ElevatorSim Server] Fatal error during startup:', err);
  process.exit(1);
});
