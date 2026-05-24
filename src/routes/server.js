import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import routes from './index.js';
import { errorHandler, notFound, requestLogger } from '../middlewares/erroHandler.js';
import { checkDatabaseConnection } from '../config/database.js';
import { runMigrations } from '../migrations/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', routes);

app.get('/health', async (_req, res) => {
  try {
    const database = await checkDatabaseConnection();
    res.json({ status: 'ok', database, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'error', message: error.message });
  }
});

app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'), (error) => {
      if (error) next();
    });
    return;
  }

  next();
});

app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  await checkDatabaseConnection();
  await runMigrations();

  app.listen(PORT, () => {
    console.log('\nTotem de Autoatendimento - Prefeitura de Guarulhos');
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`API disponivel em http://localhost:${PORT}/api`);
    console.log('Banco de dados: Supabase PostgreSQL\n');
  });
}

bootstrap().catch((error) => {
  console.error('[bootstrap] falha ao iniciar servidor:', error.message);
  process.exit(1);
});

export default app;
