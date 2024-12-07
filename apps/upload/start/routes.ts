import router from '@adonisjs/core/services/router'

const UploadsController = () => import('#controllers/uploads_controller')
const FilesController = () => import('#controllers/files_controller')

router.any('/', (ctx) => ctx.response.redirect('/api'))

router
  .group(() => {
    router.get('/', () => ({ ok: true }))
    router.post('/uploads', [UploadsController, 'handleTusHook'])
    router.get('/files/:project/:folder/:key', [FilesController])
  })
  .prefix('/api')
