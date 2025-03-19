export * from './client.js'
export * from './schema/index.js'
export * from './queries/index.js'
export * as schema from './schema/index.js'

export * from 'drizzle-orm'

// Export neon types
export { type NeonHttpDatabase } from 'drizzle-orm/neon-http'
export { type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
