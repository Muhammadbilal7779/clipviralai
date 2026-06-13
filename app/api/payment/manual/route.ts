import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const decoded = getUserFromCookie(request)
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { method, transactionId, amount } = await request.json()
  console.log('PAYMENT REQUEST:', { userId: decoded.userId, method, transactionId, amount })
  return NextResponse.json({ success: true, message: 'Payment request submitted! Admin will activate your plan within 1-2 hours.', reference: `PAY-${Date.now()}` })
}

export async function PATCH(request: NextRequest) {
  const decoded = getUserFromCookie(request)
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await db.findUserById(decoded.userId)
  if (String(user?.email) !== 'admin@clipviralai.com' && String(user?.email) !== process.env.ADMIN_EMAIL)
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  const { targetUserId } = await request.json()
  const weekFromNow = new Date(); weekFromNow.setDate(weekFromNow.getDate() + 7)
  await db.upsertSub(targetUserId, { plan: 'pro', shortsLeft: 8, shortsTotal: 8, isActive: 1, weekStart: new Date().toISOString(), expiresAt: weekFromNow.toISOString() })
  return NextResponse.json({ success: true })
}
