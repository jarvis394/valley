import { db } from '../client'
import { and, eq, sql, exists } from 'drizzle-orm'
import { Folder, Project, User, folders, projects, users } from '../schema'

export const getProjectFolder = async ({
  folderId,
  projectId,
  userId,
}: {
  folderId: Folder['id']
  projectId: Project['id']
  userId: User['id']
}) => {
  const [folder] = await db
    .select()
    .from(folders)
    .where(
      and(
        eq(folders.id, folderId),
        exists(
          db
            .select({ id: sql`TRUE` })
            .from(projects)
            .innerJoin(users, eq(projects.userId, users.id))
            .where(and(eq(users.id, userId), eq(projects.id, projectId)))
        )
      )
    )
  return folder
}
