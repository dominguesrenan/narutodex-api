import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';

// Declaração de tipos para extensão do Request
declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; email: string };
    }
  }
}

// Middleware de autenticação
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    // Verifica se o token foi fornecido
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const [bearer, token] = authHeader.split(' ');

    // Verifica se o token é válido
    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};
