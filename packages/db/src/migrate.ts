import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { createDb } from './client'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set')

const db = createDb(url, { max: 1 })

await migrate(db, { migrationsFolder: fileURLToPath(new URL('../migrations', import.meta.url)) })
await db.close()
console.log('Migrations applied')
