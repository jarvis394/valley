import router from '@adonisjs/core/services/router'

const FilesController = () => import('#controllers/files_controller')
const StorageController = () => import('#controllers/storage_controller')

router.any('/', (ctx) => ctx.response.redirect('/api'))

router
  .group(() => {
    router.get('/', () => ({ ok: true }))
    router.any('/storage', [StorageController, 'handleTusRequest'])
    router.any('/storage/*', [StorageController, 'handleTusRequest'])
    router.get('/files/:project/:folder/:key', [FilesController])
  })
  .prefix('/api')
