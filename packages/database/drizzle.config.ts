import dotenv from '@dotenvx/dotenvx'
import { defineConfig } from 'drizzle-kit'
import path from 'path'

dotenv.config({ path: path.join('../../.env') })

export default defineConfig({
  dialect: 'postgresql',
  out: './src/drizzle',
  schema: './src/schema/index.ts',
  // Resulting schema fields are in snake_case
  casing: 'snake_case',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Print all statements
  verbose: true,
  // Always ask for confirmation
  strict: true,
  breakpoints: false,
})
