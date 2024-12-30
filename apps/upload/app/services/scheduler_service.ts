import locks from '@adonisjs/lock/services/main'
import { CronJob } from 'cron'
import logger from '@adonisjs/core/services/logger'
import { JobConfig } from '#types/job'

export default class SchedulerService {
  private jobs: JobConfig[] = []

  addJob(jobConfig: JobConfig) {
    this.jobs.push(jobConfig)
  }

  scheduleSingleJob(jobConfig: JobConfig) {
    const lock = locks.createLock(jobConfig.key)
    const cronJob = new CronJob(jobConfig.cronExpression, async () => {
      let acquired: boolean = false
      try {
        acquired = await lock.acquireImmediately()
        if (!acquired) {
          logger.info(
            `[Scheduler] - Job ${jobConfig.key} is already running on another node`
          )
          return
        }

        await jobConfig.job.run()
      } catch (e) {
        logger.error(
          `[Scheduler] - An error occurred during the execution of job ${jobConfig.key}`
        )
      } finally {
        if (acquired) {
          await lock.release()
        }
      }
    })

    cronJob.start()
  }

  scheduleAllJobs() {
    this.jobs.forEach((jobConfig) => {
      this.scheduleSingleJob(jobConfig)
    })
    logger.info(
      `[Scheduler] - ${this.jobs.length} registered ${
        this.jobs.length === 1 ? 'job has' : 'jobs have'
      } been scheduled`
    )
  }
}
