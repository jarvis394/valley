import SchedulerService from '#services/scheduler_service'
import DeletePendingFilesJob from '#jobs/delete_pending_files'

const scheduler = new SchedulerService()

scheduler.addJob({
  key: 'delete_pending_files',
  cronExpression: '*/2 * * * *',
  job: new DeletePendingFilesJob(),
})

scheduler.scheduleAllJobs()
