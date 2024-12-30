import { BaseJob } from '#types/job'
import queue from '@rlanz/bull-queue/services/main'
import DeleteFileJob from '#jobs/delete_file_job'
import prisma from '#services/prisma_service'
import logger from '@adonisjs/core/services/logger'

export default class DeletePendingFilesJob extends BaseJob {
  async run() {
    const files = await prisma.file.findMany({
      where: { isPendingDeletion: true },
    })

    if (files.length === 0) return

    logger.info(`Cleaning up ${files.length} files pending deletion`)

    files.forEach(async (file) => {
      await queue.dispatch(DeleteFileJob, file)
    })
  }
}
