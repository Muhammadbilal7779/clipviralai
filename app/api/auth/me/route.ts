import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromCookie } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const decoded = getUserFromCookie(request)
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await db.findUserById(decoded.userId)
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const sub = await db.findSubByUserId(String(user.id))
  const isAdmin = String(user.email) === 'admin@clipviralai.com' || String(user.email) === process.env.ADMIN_EMAIL
  return NextResponse.json({ user: { id: String(user.id), name: String(user.name), email: String(user.email), subscription: sub, isAdmin } })
}
