export abstract class BaseJob {
  abstract run(): any
}

export interface JobConfig {
  key: string
  cronExpression: string
  job: BaseJob
}
