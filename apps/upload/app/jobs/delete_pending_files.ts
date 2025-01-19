import { BaseJob } from '#types/job'
import type { File } from '@valley/db'
import queue from '@rlanz/bull-queue/services/main'
import DeleteFileJob from '#jobs/delete_file_job'
import prisma from '#services/prisma_service'
import logger from '@adonisjs/core/services/logger'

export default class DeletePendingFilesJob extends BaseJob {
  async run() {
    let files: File[] = []
    try {
      files = await prisma.file.findMany({
        where: { isPendingDeletion: true },
      })
    } catch (e) {
      logger.error('Cannot invoke prisma.file.findMany:', e.message)
    }

    if (files.length === 0) return

    logger.info(`Cleaning up ${files.length} files pending deletion`)

    files.forEach(async (file) => {
      await queue.dispatch(DeleteFileJob, file)
    })
  }
}
