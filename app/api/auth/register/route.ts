import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()
    if (!name || !email || !password)
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    if (await db.findUserByEmail(email))
      return NextResponse.json({ error: 'This email is already registered' }, { status: 400 })

    const hashed = await hashPassword(password)
    const user = await db.createUser({ name, email, password: hashed })
    const sub = await db.createSubscription({ userId: user.id })
    const token = signToken({ userId: user.id, email: user.email })

    const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, subscription: sub, isAdmin: email === 'admin@clipviralai.com' } })
    res.cookies.set('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 604800 })
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
