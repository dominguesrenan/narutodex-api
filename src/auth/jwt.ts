import jwt from 'jsonwebtoken';
import { env } from '../env';

// Gera um token de acesso
export const generateAccessToken = (payload: { userId: number; email: string }): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

// Gera um token de atualização
export const generateRefreshToken = (payload: { userId: number; email: string }): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

// Verifica um token
export const verifyToken = (token: string): { userId: number; email: string } => {
  return jwt.verify(token, env.JWT_SECRET) as { userId: number; email: string };
};
