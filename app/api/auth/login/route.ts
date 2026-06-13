import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comparePassword, signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const user = await db.findUserByEmail(email)
    if (!user || !(await comparePassword(password, String(user.password))))
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    const sub = await db.findSubByUserId(String(user.id))
    const token = signToken({ userId: String(user.id), email: String(user.email) })
    const isAdmin = String(user.email) === 'admin@clipviralai.com' || String(user.email) === process.env.ADMIN_EMAIL

    const res = NextResponse.json({ success: true, user: { id: String(user.id), name: String(user.name), email: String(user.email), subscription: sub, isAdmin } })
    res.cookies.set('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 604800 })
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
