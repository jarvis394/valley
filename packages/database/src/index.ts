import * as accounts from './schema/accounts'
import * as avatars from './schema/avatars'
import * as covers from './schema/covers'
import * as files from './schema/files'
import * as folders from './schema/folders'
import * as projects from './schema/projects'
import * as sessions from './schema/sessions'
import * as translationStrings from './schema/translationStrings'
import * as userSettings from './schema/userSettings'
import * as users from './schema/users'
import * as verifications from './schema/verifications'

export const schema = {
  ...accounts,
  ...avatars,
  ...covers,
  ...files,
  ...folders,
  ...projects,
  ...sessions,
  ...translationStrings,
  ...userSettings,
  ...users,
  ...verifications,
}

export * from './client'
export * from './migrator'

// Database schemas
export * from './schema/accounts'
export * from './schema/avatars'
export * from './schema/covers'
export * from './schema/files'
export * from './schema/folders'
export * from './schema/projects'
export * from './schema/sessions'
export * from './schema/translationStrings'
export * from './schema/userSettings'
export * from './schema/users'
export * from './schema/verifications'

// Export neon types
export { type NeonHttpDatabase } from 'drizzle-orm/neon-http'
export { type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
