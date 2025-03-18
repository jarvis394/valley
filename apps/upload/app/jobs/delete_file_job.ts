import { Job } from '@rlanz/bull-queue'
import { File, files, eq } from '@valley/db'
import db from '#services/database_service'
import { inject } from '@adonisjs/core'
import drive from '@adonisjs/drive/services/main'

type DeleteFileJobPayload = File

@inject()
export default class DeleteFileJob extends Job {
  constructor() {
    super()
  }

  static get $$filepath() {
    return import.meta.url
  }

  async handle(file: DeleteFileJobPayload) {
    const disk = drive.use()
    this.logger.info(`Deleting... ${file.id}`)

    // Do them synchronously so job can recover if `deleteFileFromStorage()` fails
    await disk.deleteAll(file.path)
    await db.delete(files).where(eq(files.id, file.id))

    this.logger.info(`Deleted ${file.id}`)
  }

  async rescue(file: DeleteFileJobPayload, error: Error) {
    this.logger.error('Delete file job failed, rescuing:', error.message)

    try {
      await db
        .update(files)
        .set({
          deletedAt: null,
        })
        .where(eq(files.id, file.id))
    } catch (e) {
      this.logger.error('Cannot rescue delete file job:', (e as Error).message)
    }
  }
}
