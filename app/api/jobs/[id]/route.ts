import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromCookie } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = getUserFromCookie(request)
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const job = await db.findJobById(id)
  if (!job || String(job.userId) !== decoded.userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ job })
}
