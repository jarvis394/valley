import { defaultId, timestamps } from '../extend'
import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import {
  relations,
  type InferSelectModel,
  type InferInsertModel,
} from 'drizzle-orm'
import { users } from './users'

export const accounts = pgTable('accounts', {
  id: varchar().default(defaultId).primaryKey().notNull(),
  userId: varchar()
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  /**
   * The id of the account as provided by the SSO
   * or equal to userId for credential accounts
   */
  accountId: varchar().notNull(),
  /** The id of the provider */
  providerId: varchar().notNull(),
  /** The access token of the account. Returned by the provider */
  accessToken: varchar(),
  /** The refresh token of the account. Returned by the provider */
  refreshToken: varchar(),
  /** The time when the verification request expires */
  accessTokenExpiresAt: timestamp({ withTimezone: true }),
  /** The time when the verification request expires */
  refreshTokenExpiresAt: timestamp({ withTimezone: true }),
  /** The scope of the account. Returned by the provider */
  scope: varchar(),
  /** The id token returned from the provider */
  idToken: varchar(),
  /**
   * The password of the account.
   * Mainly used for email and password authentication
   */
  password: varchar(),
  ...timestamps(),
})

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export type Account = InferSelectModel<typeof accounts>

export type NewAccount = InferInsertModel<typeof accounts>
