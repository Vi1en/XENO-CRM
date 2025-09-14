import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret') as any;
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret') as any;
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
    };
  } catch (error) {
    // Ignore auth errors for optional auth
  }
  
  return next();
}
