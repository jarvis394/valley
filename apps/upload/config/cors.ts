import env from '#start/env'
import { defineConfig } from '@adonisjs/cors'

export const ALLOWED_ORIGINS = [
  `http://localhost:${env.get('WEB_PORT')}`,
  env.get('HOST'),
  env.get('WEB_SERVICE_URL'),
  env.get('UPLOAD_SERVICE_URL'),
]

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  credentials: true,
  maxAge: 90,
})

export default corsConfig
