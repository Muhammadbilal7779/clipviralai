import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Test connection by querying users
    await prisma.user.count()
    return NextResponse.json({ status: 'ok', db: 'connected' })
  } catch (e: any) {
    return NextResponse.json({ status: 'error', message: e.message }, { status: 500 })
  }
}
