import 'dotenv/config';
import { startServer } from './app/index.js';
import { logger } from './shared/index.js';

async function main() {
  await startServer();
}

main().catch((error) => {
  logger.error("Fatal error in main()", error as Error);
  process.exit(1);
});
