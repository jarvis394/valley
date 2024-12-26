import { Job } from '@rlanz/bull-queue'
import { File } from '@valley/db'
import prisma from '#services/prisma_service'
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
    await disk.deleteAll(file.key)
    await prisma.file.delete({ where: { id: file.id } })

    this.logger.info(`Deleted ${file.id}`)
  }

  async rescue(file: DeleteFileJobPayload, error: Error) {
    this.logger.error('Delete file job failed, rescuing:', error.message)

    try {
      await prisma.file.update({
        where: { id: file.id },
        data: { isPendingDeletion: false },
      })
    } catch (e) {
      this.logger.error('Cannot rescue delete file job:', (e as Error).message)
    }
  }
}
