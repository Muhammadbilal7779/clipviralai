import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  console.log('DB Init — TURSO_DATABASE_URL:', url ? url.substring(0, 30) + '...' : 'NOT SET')

  if (url) {
    const { createClient } = require('@libsql/client')
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    
    const turso = createClient({
      url: url,
      authToken: authToken ?? '',
    })
    
    const adapter = new PrismaLibSQL(turso)
    return new PrismaClient({ adapter } as any)
  }

  return new PrismaClient()
}

export const prisma: PrismaClient =
  global.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}
