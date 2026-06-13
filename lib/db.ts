import { getTurso, initDB } from './turso'
import { v4 as uuid } from 'uuid'

let dbInitialized = false

async function getDB() {
  const db = getTurso()
  if (!dbInitialized) {
    await initDB()
    dbInitialized = true
  }
  return db
}

export const db = {
  // USERS
  async createUser(data: { name: string; email: string; password: string }) {
    const db = await getDB()
    const id = uuid()
    const createdAt = new Date().toISOString()
    await db.execute({
      sql: 'INSERT INTO User (id, email, password, name, createdAt) VALUES (?, ?, ?, ?, ?)',
      args: [id, data.email, data.password, data.name, createdAt]
    })
    return { id, ...data, createdAt }
  },

  async findUserByEmail(email: string) {
    const db = await getDB()
    const result = await db.execute({
      sql: 'SELECT * FROM User WHERE email = ? LIMIT 1',
      args: [email]
    })
    return result.rows[0] || null
  },

  async findUserById(id: string) {
    const db = await getDB()
    const result = await db.execute({
      sql: 'SELECT * FROM User WHERE id = ? LIMIT 1',
      args: [id]
    })
    return result.rows[0] || null
  },

  // SUBSCRIPTIONS
  async createSubscription(data: { userId: string; plan?: string; shortsLeft?: number; shortsTotal?: number }) {
    const db = await getDB()
    const id = uuid()
    const plan = data.plan || 'free'
    const shortsLeft = data.shortsLeft ?? 2
    const shortsTotal = data.shortsTotal ?? 2
    const createdAt = new Date().toISOString()
    await db.execute({
      sql: 'INSERT INTO Subscription (id, userId, plan, shortsLeft, shortsTotal, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, data.userId, plan, shortsLeft, shortsTotal, createdAt]
    })
    return { id, userId: data.userId, plan, shortsLeft, shortsTotal, isActive: 1, createdAt }
  },

  async findSubByUserId(userId: string) {
    const db = await getDB()
    const result = await db.execute({
      sql: 'SELECT * FROM Subscription WHERE userId = ? LIMIT 1',
      args: [userId]
    })
    return result.rows[0] || null
  },

  async updateSub(userId: string, updates: any) {
    const db = await getDB()
    const sets = Object.keys(updates).map(k => `${k} = ?`).join(', ')
    const vals = [...Object.values(updates), userId]
    await db.execute({ sql: `UPDATE Subscription SET ${sets} WHERE userId = ?`, args: vals })
    return this.findSubByUserId(userId)
  },

  async upsertSub(userId: string, data: any) {
    const db = await getDB()
    const existing = await this.findSubByUserId(userId)
    if (existing) {
      return this.updateSub(userId, data)
    }
    return this.createSubscription({ userId, ...data })
  },

  // JOBS
  async createJob(data: { userId: string; videoUrl: string; platform: string; style: string; count: number }) {
    const db = await getDB()
    const id = uuid()
    const createdAt = new Date().toISOString()
    await db.execute({
      sql: 'INSERT INTO Job (id, userId, videoUrl, platform, style, count, status, progress, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [id, data.userId, data.videoUrl, data.platform, data.style, data.count, 'processing', 0, createdAt, createdAt]
    })
    return { id, ...data, status: 'processing', progress: 0, createdAt }
  },

  async findJobsByUser(userId: string) {
    const db = await getDB()
    const jobs = await db.execute({
      sql: 'SELECT * FROM Job WHERE userId = ? ORDER BY createdAt DESC',
      args: [userId]
    })
    const result = []
    for (const job of jobs.rows) {
      const shorts = await db.execute({ sql: 'SELECT * FROM Short WHERE jobId = ?', args: [job.id as string] })
      result.push({ ...job, shorts: shorts.rows })
    }
    return result
  },

  async findJobById(id: string) {
    const db = await getDB()
    const result = await db.execute({ sql: 'SELECT * FROM Job WHERE id = ? LIMIT 1', args: [id] })
    if (!result.rows[0]) return null
    const shorts = await db.execute({ sql: 'SELECT * FROM Short WHERE jobId = ?', args: [id] })
    return { ...result.rows[0], shorts: shorts.rows }
  },

  async updateJob(id: string, updates: any) {
    const db = await getDB()
    updates.updatedAt = new Date().toISOString()
    const sets = Object.keys(updates).map(k => `${k} = ?`).join(', ')
    const vals = [...Object.values(updates), id]
    await db.execute({ sql: `UPDATE Job SET ${sets} WHERE id = ?`, args: vals })
  },

  // SHORTS
  async createShort(data: { jobId: string; filename: string; viralScore: number; duration: number; caption: string }) {
    const db = await getDB()
    const id = uuid()
    const createdAt = new Date().toISOString()
    await db.execute({
      sql: 'INSERT INTO Short (id, jobId, filename, viralScore, duration, caption, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [id, data.jobId, data.filename, data.viralScore, data.duration, data.caption, createdAt]
    })
    return { id, ...data, createdAt }
  },

  // ADMIN
  async getAllUsers() {
    const db = await getDB()
    const users = await db.execute('SELECT * FROM User ORDER BY createdAt DESC')
    const result = []
    for (const user of users.rows) {
      const sub = await db.execute({ sql: 'SELECT * FROM Subscription WHERE userId = ? LIMIT 1', args: [user.id as string] })
      const jobs = await db.execute({ sql: 'SELECT * FROM Job WHERE userId = ?', args: [user.id as string] })
      const jobsWithShorts = []
      for (const job of jobs.rows) {
        const shorts = await db.execute({ sql: 'SELECT * FROM Short WHERE jobId = ?', args: [job.id as string] })
        jobsWithShorts.push({ ...job, shorts: shorts.rows })
      }
      result.push({ ...user, subscription: sub.rows[0] || null, jobs: jobsWithShorts })
    }
    return result
  }
}
