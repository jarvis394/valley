import { Folder } from '@valley/db'
import axios from 'axios'

type EditFolderApiProps = {
  folderId: Folder['id']
  title?: Folder['title']
  description?: Folder['description']
}

export const editFolder = async ({
  folderId,
  title,
  description,
}: EditFolderApiProps) => {
  const formData = new FormData()
  title && formData.set('title', title)
  description !== undefined && formData.set('description', description || '')
  const res = await axios.post('/api/folders/' + folderId + '/edit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return res.data
}
