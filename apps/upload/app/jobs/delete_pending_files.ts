import { BaseJob } from '#types/job'
import { type File, files as filesTable, eq } from '@valley/db'
import db from '#services/database_service'
import logger from '@adonisjs/core/services/logger'
import drive from '@adonisjs/drive/services/main'

export default class DeletePendingFilesJob extends BaseJob {
  async run() {
    let files: File[] = []
    try {
      files = await db.query.files.findMany({
        where: (table, { isNotNull }) => isNotNull(table.deletedAt),
      })
    } catch (e) {
      console.error('Cannot invoke db.query.files.findMany:', e)
    }

    if (files.length === 0) return

    logger.info(`Cleaning up ${files.length} files pending deletion`)

    files.forEach(async (file) => {
      const disk = drive.use()
      logger.info(`Deleting... ${file.id}`)

      await disk.deleteAll(file.path)
      await db.delete(filesTable).where(eq(filesTable.id, file.id))

      logger.info(`Deleted ${file.id}`)
    })
  }
}
