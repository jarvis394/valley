import { relations } from 'drizzle-orm'
import { assets } from './assets'
import { account, session, user } from './auth'
import { projects } from './projects'

export const userRelations = relations(user, ({ many }) => ({
  projects: many(projects),
  sessions: many(session),
  accounts: many(account),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  account: one(user, { fields: [projects.accountId], references: [user.id] }),
  assets: many(assets),
}))

export const assetsRelations = relations(assets, ({ one }) => ({
  project: one(projects, { fields: [assets.projectId], references: [projects.id] }),
}))
