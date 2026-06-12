import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

function createClient(): PrismaClient {
  if (process.env.TURSO_DATABASE_URL) {
    const { createClient } = require('@libsql/client')
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    })
    const adapter = new PrismaLibSQL(turso)
    return new PrismaClient({ adapter } as any)
  }
  return new PrismaClient()
}

export const prisma: PrismaClient = global.__prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}
