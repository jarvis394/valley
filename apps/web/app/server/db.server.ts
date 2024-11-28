import { remember } from '../utils/remember'
import { PrismaClient } from '@valley/db'
import pkg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import ansis from 'ansis'

const { Pool } = pkg

// NOTE: if you change anything in this function you'll need to restart
// the dev server to see your changes.
export const prisma = remember('prisma', () => {
  const logThreshold = 60
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const client = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
    adapter,
  })

  client.$on('query', async (e) => {
    if (e.duration < logThreshold) return
    const color =
      e.duration < logThreshold * 1.1
        ? 'green'
        : e.duration < logThreshold * 1.2
          ? 'blue'
          : e.duration < logThreshold * 1.3
            ? 'yellow'
            : e.duration < logThreshold * 1.4
              ? 'redBright'
              : 'red'
    const dur = ansis[color](`${e.duration}ms`)
    console.info(`prisma:query - ${dur} - ${e.query}`)
  })

  void client.$connect()

  return client
})
