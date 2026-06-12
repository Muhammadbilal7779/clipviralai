import { prisma } from './prisma'

export const db = {
  // USERS
  async createUser(data: { name: string; email: string; password: string }) {
    return prisma.user.create({ data })
  },
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  },
  async findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  },

  // SUBSCRIPTIONS
  async createSubscription(data: { userId: string; plan?: string; shortsLeft?: number; shortsTotal?: number }) {
    return prisma.subscription.create({
      data: {
        userId: data.userId,
        plan: data.plan || 'free',
        shortsLeft: data.shortsLeft ?? 2,
        shortsTotal: data.shortsTotal ?? 2,
      }
    })
  },
  async findSubByUserId(userId: string) {
    return prisma.subscription.findUnique({ where: { userId } })
  },
  async updateSub(userId: string, updates: any) {
    return prisma.subscription.update({ where: { userId }, data: updates })
  },
  async upsertSub(userId: string, data: any) {
    return prisma.subscription.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data }
    })
  },

  // JOBS
  async createJob(data: { userId: string; videoUrl: string; platform: string; style: string; count: number }) {
    return prisma.job.create({ data: { ...data, status: 'processing', progress: 0 } })
  },
  async findJobsByUser(userId: string) {
    return prisma.job.findMany({
      where: { userId },
      include: { shorts: true },
      orderBy: { createdAt: 'desc' }
    })
  },
  async findJobById(id: string) {
    return prisma.job.findUnique({ where: { id }, include: { shorts: true } })
  },
  async updateJob(id: string, updates: any) {
    return prisma.job.update({ where: { id }, data: updates })
  },

  // SHORTS
  async createShort(data: { jobId: string; filename: string; viralScore: number; duration: number; caption: string }) {
    return prisma.short.create({ data })
  },

  // ADMIN
  async getAllUsers() {
    return prisma.user.findMany({
      include: {
        subscription: true,
        jobs: { include: { shorts: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
  }
}
