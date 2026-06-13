import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromCookie } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const decoded = getUserFromCookie(request)
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const jobs = await db.findJobsByUser(decoded.userId)
  return NextResponse.json({ jobs })
}

export async function POST(request: NextRequest) {
  const decoded = getUserFromCookie(request)
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { videoUrl, style, count } = await request.json()
    if (!videoUrl) return NextResponse.json({ error: 'Please enter a video URL' }, { status: 400 })
    const sub = await db.findSubByUserId(decoded.userId)
    const shortsLeft = Number(sub?.shortsLeft || 0)
    if (!sub || shortsLeft < count)
      return NextResponse.json({ error: `You only have ${shortsLeft} shorts remaining. Please upgrade!` }, { status: 403 })
    const platform = videoUrl.includes('tiktok') ? 'tiktok' : videoUrl.includes('youtu') ? 'youtube' : 'other'
    const job = await db.createJob({ userId: decoded.userId, videoUrl, platform, style, count })
    await db.updateSub(decoded.userId, { shortsLeft: shortsLeft - count })
    processInBackground(String(job.id), videoUrl, style, count)
    return NextResponse.json({ job, message: 'Processing started!' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

async function processInBackground(jobId: string, url: string, style: string, count: number) {
  try {
    const { processVideo } = await import('@/lib/videoProcessor')
    const shorts = await processVideo(url, style, count, jobId, async (progress: number) => {
      await db.updateJob(jobId, { progress, status: progress < 100 ? 'processing' : 'done' })
    })
    for (const s of shorts) {
      await db.createShort({ jobId, filename: s.filename, viralScore: s.viralScore, duration: s.duration, caption: s.caption })
    }
    await db.updateJob(jobId, { status: 'done', progress: 100 })
  } catch (e: any) {
    await db.updateJob(jobId, { status: 'failed', progress: 0 })
    console.error('Job failed:', e.message)
  }
}
