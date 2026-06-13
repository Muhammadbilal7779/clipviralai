import { getTurso, initDB } from './turso'
import { v4 as uuid } from 'uuid'

let initialized = false

async function q(sql: string, args: any[] = []) {
  const db = getTurso()
  if (!initialized) { await initDB(); initialized = true }
  const r = await db.execute({ sql, args })
  return r.rows
}

function row2obj(row: any): any {
  if (!row) return null
  const obj: any = {}
  for (const key of Object.keys(row)) obj[key] = row[key] !== null ? String(row[key]) : null
  return obj
}

export const db = {
  async createUser(data: { name: string; email: string; password: string }) {
    const id = uuid()
    const now = new Date().toISOString()
    await q('INSERT INTO User (id,email,password,name,createdAt) VALUES (?,?,?,?,?)',
      [id, data.email, data.password, data.name, now])
    return { id, ...data, createdAt: now }
  },

  async findUserByEmail(email: string) {
    const rows = await q('SELECT * FROM User WHERE email=? LIMIT 1', [email])
    return rows[0] ? row2obj(rows[0]) : null
  },

  async findUserById(id: string) {
    const rows = await q('SELECT * FROM User WHERE id=? LIMIT 1', [id])
    return rows[0] ? row2obj(rows[0]) : null
  },

  async createSubscription(data: { userId: string; plan?: string; shortsLeft?: number; shortsTotal?: number }) {
    const id = uuid()
    const plan = data.plan || 'free'
    const sl = data.shortsLeft ?? 2
    const st = data.shortsTotal ?? 2
    const now = new Date().toISOString()
    await q('INSERT INTO Subscription (id,userId,plan,shortsLeft,shortsTotal,createdAt) VALUES (?,?,?,?,?,?)',
      [id, data.userId, plan, sl, st, now])
    return { id, userId: data.userId, plan, shortsLeft: sl, shortsTotal: st, isActive: '1', createdAt: now }
  },

  async findSubByUserId(userId: string) {
    const rows = await q('SELECT * FROM Subscription WHERE userId=? LIMIT 1', [userId])
    return rows[0] ? row2obj(rows[0]) : null
  },

  async updateSub(userId: string, updates: Record<string, any>) {
    const sets = Object.keys(updates).map(k => `${k}=?`).join(',')
    await q(`UPDATE Subscription SET ${sets} WHERE userId=?`, [...Object.values(updates), userId])
    return this.findSubByUserId(userId)
  },

  async upsertSub(userId: string, data: Record<string, any>) {
    const existing = await this.findSubByUserId(userId)
    if (existing) return this.updateSub(userId, data)
    return this.createSubscription({ userId, ...data })
  },

  async createJob(data: { userId: string; videoUrl: string; platform: string; style: string; count: number }) {
    const id = uuid()
    const now = new Date().toISOString()
    await q('INSERT INTO Job (id,userId,videoUrl,platform,style,count,status,progress,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, data.userId, data.videoUrl, data.platform, data.style, data.count, 'processing', 0, now, now])
    return { id, ...data, status: 'processing', progress: 0, createdAt: now, shorts: [] }
  },

  async findJobsByUser(userId: string) {
    const jobs = await q('SELECT * FROM Job WHERE userId=? ORDER BY createdAt DESC', [userId])
    const result = []
    for (const job of jobs) {
      const shorts = await q('SELECT * FROM Short WHERE jobId=?', [job.id as string])
      result.push({ ...row2obj(job), shorts: shorts.map(row2obj) })
    }
    return result
  },

  async findJobById(id: string) {
    const rows = await q('SELECT * FROM Job WHERE id=? LIMIT 1', [id])
    if (!rows[0]) return null
    const shorts = await q('SELECT * FROM Short WHERE jobId=?', [id])
    return { ...row2obj(rows[0]), shorts: shorts.map(row2obj) }
  },

  async updateJob(id: string, updates: Record<string, any>) {
    updates.updatedAt = new Date().toISOString()
    const sets = Object.keys(updates).map(k => `${k}=?`).join(',')
    await q(`UPDATE Job SET ${sets} WHERE id=?`, [...Object.values(updates), id])
  },

  async createShort(data: { jobId: string; filename: string; viralScore: number; duration: number; caption: string }) {
    const id = uuid()
    const now = new Date().toISOString()
    await q('INSERT INTO Short (id,jobId,filename,viralScore,duration,caption,createdAt) VALUES (?,?,?,?,?,?,?)',
      [id, data.jobId, data.filename, data.viralScore, data.duration, data.caption, now])
    return { id, ...data, createdAt: now }
  },

  async getAllUsers() {
    const users = await q('SELECT * FROM User ORDER BY createdAt DESC')
    const result = []
    for (const user of users) {
      const sub = await q('SELECT * FROM Subscription WHERE userId=? LIMIT 1', [user.id as string])
      const jobs = await q('SELECT * FROM Job WHERE userId=?', [user.id as string])
      const jobsWithShorts = []
      for (const job of jobs) {
        const shorts = await q('SELECT * FROM Short WHERE jobId=?', [job.id as string])
        jobsWithShorts.push({ ...row2obj(job), shorts: shorts.map(row2obj) })
      }
      result.push({ ...row2obj(user), subscription: sub[0] ? row2obj(sub[0]) : null, jobs: jobsWithShorts })
    }
    return result
  }
}
