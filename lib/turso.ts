// Direct Turso HTTP client - no Prisma adapter needed
import { createClient, type Client } from '@libsql/client/http'

let client: Client | null = null

export function getTurso(): Client {
  if (client) return client
  
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url) throw new Error('TURSO_DATABASE_URL not set')

  // Convert libsql:// to https:// for HTTP client
  const httpUrl = url.replace('libsql://', 'https://')
  
  console.log('Connecting to Turso via HTTP:', httpUrl.substring(0, 40) + '...')
  
  client = createClient({ url: httpUrl, authToken: authToken || '' })
  return client
}

// Initialize tables
export async function initDB() {
  const db = getTurso()
  
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS Subscription (
      id TEXT PRIMARY KEY,
      userId TEXT UNIQUE NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      shortsLeft INTEGER NOT NULL DEFAULT 2,
      shortsTotal INTEGER NOT NULL DEFAULT 2,
      weekStart TEXT NOT NULL DEFAULT (datetime('now')),
      isActive INTEGER NOT NULL DEFAULT 1,
      paymentMethod TEXT NOT NULL DEFAULT 'manual',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      expiresAt TEXT
    );

    CREATE TABLE IF NOT EXISTS Job (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      videoUrl TEXT NOT NULL,
      platform TEXT NOT NULL,
      style TEXT NOT NULL,
      count INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      progress INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS Short (
      id TEXT PRIMARY KEY,
      jobId TEXT NOT NULL,
      filename TEXT NOT NULL,
      viralScore INTEGER NOT NULL,
      duration REAL NOT NULL,
      caption TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
  
  console.log('DB tables initialized!')
}
