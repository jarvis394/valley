import { db, File, files, User, users } from '@valley/db'
import { and, eq } from 'drizzle-orm'

export const getFile = async ({
  userId,
  fileId,
}: {
  userId: User['id']
  fileId: File['id']
}) => {
  const [file] = await db
    .select()
    .from(files)
    .leftJoin(users, eq(users.id, userId))
    .where(and(eq(users.id, userId), eq(files.id, fileId)))

  return file
}
