import { fileURLToPath } from 'node:url'
import { getDb, loadEnvFiles } from '@valley/backend'
import { eq, sql, user } from '@valley/db'

loadEnvFiles(
  ['../.env', '../../../.env'].map((file) => fileURLToPath(new URL(file, import.meta.url))),
)

const [email] = process.argv.slice(2)

if (!email) {
  console.error('usage: bun run --cwd apps/web grant-admin <email>')
  process.exit(1)
}

const db = getDb()
const normalized = email.trim().toLowerCase()

const [updated] = await db
  .update(user)
  .set({ role: 'admin', approvedAt: sql`coalesce(${user.approvedAt}, now())` })
  .where(eq(user.email, normalized))
  .returning({ name: user.name, email: user.email })

await db.close()

if (!updated) {
  console.error(`No user with email ${normalized}`)
  process.exit(1)
}

console.log(`${updated.name} (${updated.email}) is now an admin`)
