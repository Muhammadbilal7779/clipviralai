import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    await db.getAllUsers()
    return NextResponse.json({ status: 'ok', db: 'connected' })
  } catch (e: any) {
    return NextResponse.json({ status: 'error', message: e.message }, { status: 500 })
  }
}
