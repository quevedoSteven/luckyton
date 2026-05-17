import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends Request {
  userId?: string
  walletAddress?: string
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Token missing' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      walletAddress: string
      id: string
    }

    req.userId = decoded.id
    req.walletAddress = decoded.walletAddress
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
