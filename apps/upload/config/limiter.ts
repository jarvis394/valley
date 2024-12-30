import { defineConfig, stores } from '@adonisjs/limiter'

const limiterConfig = defineConfig({
  default: 'redis',
  stores: {
    redis: stores.redis({}),
  },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
