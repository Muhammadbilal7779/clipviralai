import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromCookie } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const decoded = getUserFromCookie(request)
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await db.findUserById(decoded.userId)
  if (user?.email !== 'admin@clipviralai.com' && user?.email !== process.env.ADMIN_EMAIL)
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  const users = await db.getAllUsers()
  const stats = {
    totalUsers: users.length,
    proUsers: users.filter((u: any) => u.subscription?.plan === 'pro').length,
    weeklyRevenue: users.filter((u: any) => u.subscription?.plan === 'pro').length,
    totalShortsGenerated: users.reduce((a: number, u: any) => a + u.jobs.reduce((b: number, j: any) => b + (j.shorts?.length || 0), 0), 0)
  }
  return NextResponse.json({ users, stats })
}
