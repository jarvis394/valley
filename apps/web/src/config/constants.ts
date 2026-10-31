import { version } from '../../package.json'

const galleryServiceUrl = import.meta.env.GALLERY_SERVICE_URL
if (!galleryServiceUrl)
  throw new Error('GALLERY_SERVICE_URL is not set; copy apps/web/.env.example to apps/web/.env')

export const GALLERY_SERVICE_URL = galleryServiceUrl.replace(/\/+$/, '')

export const APP_VERSION = version
export const REPOSITORY_URL = 'https://github.com/jarvis394/valley'
