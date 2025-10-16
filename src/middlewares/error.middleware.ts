import { Request, Response, NextFunction } from 'express';

// Classe de erro personalizada
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Middleware de tratamento de erros
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const message = err.message || 'Erro interno do servidor';

  // Log do erro
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Resposta do erro
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
