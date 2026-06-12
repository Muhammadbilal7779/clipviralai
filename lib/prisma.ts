import { PrismaClient } from '@prisma/client'

declare global {
  var prismaGlobal: PrismaClient | undefined
}

function createClient(): PrismaClient {
  if (process.env.TURSO_DATABASE_URL) {
    // Use Turso on Railway
    const { createClient } = require('@libsql/client')
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    })
    const adapter = new PrismaLibSQL(turso)
    return new PrismaClient({ adapter })
  }
  // Local fallback
  return new PrismaClient()
}

export const prisma: PrismaClient =
  global.prismaGlobal ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma
}
