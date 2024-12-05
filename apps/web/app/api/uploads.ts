import { Folder, Project, UploadToken } from '@valley/db'
import axios from 'axios'

type CreateUploadTokenProps = {
  projectId: Project['id']
  folderId: Folder['id']
}

export const createUploadToken = async ({
  projectId,
  folderId,
}: CreateUploadTokenProps) => {
  const formData = new FormData()
  formData.set('projectId', projectId)
  formData.set('folderId', folderId)
  const token = await axios.post<{ data: UploadToken }>(
    '/api/upload/createUploadToken',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  )

  return token.data.data
}
