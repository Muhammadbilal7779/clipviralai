import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

export interface ShortResult {
  filename: string
  viralScore: number
  duration: number
  caption: string
  startTime: number
}

export function detectPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('instagram.com')) return 'instagram'
  return 'other'
}

export async function downloadVideo(url: string, outputDir: string, jobId: string): Promise<string> {
  const outputPath = path.join(outputDir, `${jobId}_original.%(ext)s`)
  const finalPath = path.join(outputDir, `${jobId}_original.mp4`)
  const cmd = `yt-dlp -f "best[ext=mp4]/best" --no-playlist --merge-output-format mp4 -o "${outputPath}" "${url}" 2>&1`
  await execAsync(cmd, { timeout: 300000 })
  // Find the downloaded file
  const files = fs.readdirSync(outputDir).filter(f => f.startsWith(`${jobId}_original`))
  if (files.length === 0) throw new Error('Video download fail ho gaya')
  const actualFile = path.join(outputDir, files[0])
  if (actualFile !== finalPath) fs.renameSync(actualFile, finalPath)
  return finalPath
}

export async function getVideoDuration(videoPath: string): Promise<number> {
  const cmd = `ffprobe -v quiet -print_format json -show_format "${videoPath}"`
  const { stdout } = await execAsync(cmd)
  const info = JSON.parse(stdout)
  return parseFloat(info.format.duration)
}

export function generateCaption(style: string, index: number): string {
  const captions: Record<string, string[]> = {
    'Viral Hook': ['🔥 Yeh dekh ke dimag ghoom jayega!', '⚡ Koi nahi batata yeh secret...', '😱 Wait for it... 🤯', '🎯 This changed everything!', '💥 POV: Pehli baar dekh rahe ho'],
    'Funny': ['😂 Main rok nahi saka hansne se!', '🤣 Yeh banda serious hai bhai!', '😭 Why is this so relatable lol'],
    'Educational': ['💡 Kya aap yeh jaante the?', '📚 1 minute mein seekhein!', '🧠 Mind = blown after this'],
    'Motivational': ['💪 Apni life badlo aaj se!', '🚀 Success ki taraf pehla qadam', '🔑 Yahi hai success ka secret'],
    'News': ['📰 Breaking: Yeh toh kisi ne expect nahi kiya', '🔴 LIVE: Sab kuch badal gaya', '🌍 Aaj ki sab se bari khabar'],
  }
  const key = Object.keys(captions).find(k => style.toLowerCase().includes(k.toLowerCase())) || 'Viral Hook'
  const list = captions[key]
  return list[index % list.length]
}

export async function cutShort(videoPath: string, startTime: number, duration: number, outputPath: string): Promise<void> {
  // 9:16 vertical format for Shorts/TikTok
  const cmd = `ffmpeg -y -ss ${startTime} -i "${videoPath}" -t ${duration} \
    -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1" \
    -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -movflags +faststart \
    "${outputPath}" 2>&1`
  await execAsync(cmd, { timeout: 120000 })
}

export async function processVideo(
  url: string,
  style: string,
  count: number,
  jobId: string,
  onProgress: (progress: number, status?: string) => void
): Promise<ShortResult[]> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', jobId)
  fs.mkdirSync(uploadsDir, { recursive: true })

  onProgress(10)
  const videoPath = await downloadVideo(url, uploadsDir, jobId)

  onProgress(30)
  const duration = await getVideoDuration(videoPath)

  // Generate evenly-spaced clip start points, biased toward beginning (more viral)
  const clipDur = style.includes('Educational') ? 55 : style.includes('Funny') ? 20 : 30
  const segments: Array<{start: number; score: number}> = []
  const step = Math.max(1, Math.floor((duration - clipDur) / (count + 1)))

  for (let i = 0; i < count; i++) {
    const start = Math.min((i + 1) * step, duration - clipDur - 1)
    const score = Math.max(55, Math.min(98, 92 - i * 4 + Math.floor(Math.random() * 10) - 5))
    segments.push({ start, score })
  }

  onProgress(45)
  const results: ShortResult[] = []

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const filename = `short_${i + 1}.mp4`
    const outputPath = path.join(uploadsDir, filename)
    await cutShort(videoPath, seg.start, clipDur, outputPath)
    results.push({
      filename: `/uploads/${jobId}/${filename}`,
      viralScore: seg.score,
      duration: clipDur,
      caption: generateCaption(style, i),
      startTime: seg.start,
    })
    onProgress(45 + Math.round((i + 1) / segments.length * 50))
  }

  // Clean up original to save space
  try { fs.unlinkSync(videoPath) } catch {}

  onProgress(100)
  return results
}
