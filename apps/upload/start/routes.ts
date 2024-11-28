import router from '@adonisjs/core/services/router'

const UploadsController = () => import('#controllers/uploads_controller')
const FilesController = () => import('#controllers/files_controller')

router
  .group(() => {
    router.post('/', () => ({ ok: true }))
    router.post('/uploads', [UploadsController, 'handleTusHook'])
    router.post('/uploads/getUploadToken', [
      UploadsController,
      'getUploadToken',
    ])
    router.get('/files/:project/:folder/:key', [FilesController])
  })
  .prefix('/api')
