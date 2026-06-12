import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const decoded = getUserFromCookie(request)
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { method, transactionId, amount } = await request.json()
  console.log('PAYMENT REQUEST:', { userId: decoded.userId, method, transactionId, amount, time: new Date().toISOString() })
  return NextResponse.json({ success: true, message: 'Payment request receive ho gaya! Admin 1-2 ghante mein approve karega.', reference: `PAY-${Date.now()}` })
}

export async function PATCH(request: NextRequest) {
  const decoded = getUserFromCookie(request)
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await db.findUserById(decoded.userId)
  if (user?.email !== 'admin@clipviralai.com' && user?.email !== process.env.ADMIN_EMAIL)
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  const { targetUserId } = await request.json()
  const weekFromNow = new Date(); weekFromNow.setDate(weekFromNow.getDate() + 7)
  await db.upsertSub(targetUserId, { plan: 'pro', shortsLeft: 8, shortsTotal: 8, isActive: true, weekStart: new Date(), expiresAt: weekFromNow })
  return NextResponse.json({ success: true })
}
