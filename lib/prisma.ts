import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  console.log('TURSO_DATABASE_URL:', url ? 'SET' : 'NOT SET')
  console.log('TURSO_AUTH_TOKEN:', authToken ? 'SET' : 'NOT SET')

  if (url && url !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createClient } = require('@libsql/client')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    const turso = createClient({ url, authToken: authToken || '' })
    const adapter = new PrismaLibSQL(turso)
    return new PrismaClient({ adapter })
  }

  console.warn('WARNING: Using local SQLite — data will be lost on restart!')
  return new PrismaClient()
}

export const prisma: PrismaClient =
  global.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}
