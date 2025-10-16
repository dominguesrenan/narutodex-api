import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { healthcheck } from './db';
import { personagens } from './routes/personagens';
import { narutoRoutes } from './routes/naruto';
import authRoutes from './auth/auth.routes';
import { errorHandler } from './middlewares/error.middleware';
import { authenticate } from './auth/auth.middleware';

const app = express();

// Configuração do CORS
const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'https://narutodex.pages.dev',
      'http://localhost:8080',
      'http://localhost:3000',
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Health
app.get('/health', async (_req, res, next) => {
  try {
    await healthcheck();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Rotas públicas de autenticação
app.use('/auth', authRoutes);

// Rotas públicas de Naruto (aldeias, clãs, ranks, elementos, times, estatísticas)
app.use('/api/naruto', narutoRoutes);

// Rotas públicas de personagens (apenas leitura)
app.use('/api/personagens', (req, res, next) => {
  if (req.method === 'GET') {
    return personagens(req, res, next);
  }
  next();
});

// Rotas autenticadas de personagens (CRUD completo)
app.use('/api/personagens', authenticate, personagens);

// Middleware de erros
app.use(errorHandler);

// Porta e host
const PORT = Number(process.env.PORT || 4000);
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Narutodex API listening on http://${HOST}:${PORT}`);
});
