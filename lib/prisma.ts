import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  console.log('DB Init — TURSO_DATABASE_URL:', url ? url.substring(0, 30) + '...' : 'NOT SET')
  console.log('DB Init — authToken length:', authToken ? authToken.length : 0)

  if (url) {
    try {
      const libsql = require('@libsql/client')
      const prismaLibsql = require('@prisma/adapter-libsql')

      console.log('libsql exports:', Object.keys(libsql))
      console.log('prismaLibsql exports:', Object.keys(prismaLibsql))

      const turso = libsql.createClient({
        url: url,
        authToken: authToken || undefined,
      })

      console.log('Turso client created:', turso ? 'yes' : 'no')

      const adapter = new prismaLibsql.PrismaLibSQL(turso)
      return new PrismaClient({ adapter } as any)
    } catch (e: any) {
      console.error('Failed to create Turso client:', e.message)
    }
  }

  console.warn('Falling back to local SQLite')
  return new PrismaClient()
}

export const prisma: PrismaClient =
  global.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}
