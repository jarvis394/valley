import env from '#start/env'
import { defineConfig } from '@rlanz/bull-queue'

export default defineConfig({
  defaultConnection: {
    host: env.get('REDIS_HOST'),
    port: env.get('REDIS_PORT'),
    password: env.get('REDIS_PASSWORD'),
  },
  queue: {},
  worker: {},
  jobs: {
    attempts: 1,
    // backoff: {
    //   type: 'exponential',
    //   delay: 5000,
    // },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
})
