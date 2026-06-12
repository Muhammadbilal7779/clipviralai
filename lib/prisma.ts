import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  console.log('DB Init — URL:', url ? 'SET' : 'NOT SET')

  if (url) {
    try {
      const { createClient } = require('@libsql/client')
      const { PrismaLibSQL } = require('@prisma/adapter-libsql')

      // Pass config object directly to PrismaLibSQL - skip manual createClient
      const adapter = new PrismaLibSQL({
        url: url,
        authToken: authToken || '',
      })

      console.log('Adapter created, connecting to Turso...')
      return new PrismaClient({ adapter } as any)
    } catch (e: any) {
      console.error('Turso connection failed:', e.message)
    }
  }

  console.warn('Using local SQLite fallback')
  return new PrismaClient()
}

export const prisma: PrismaClient =
  global.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}
