import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function getUserFromCookie(request: Request): any {
  const cookieHeader = request.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(/token=([^;]+)/)
  if (!tokenMatch) return null
  return verifyToken(decodeURIComponent(tokenMatch[1]))
}
