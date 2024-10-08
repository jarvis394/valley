import React from 'react'
import axios from 'axios'
import { API_URL } from '../../../config/constants'
import {} from 'next/server'

type GalleryPageProps = {
  params: {
    username: string
    projectSlug: string
  }
}

const GalleryPage: React.FC<GalleryPageProps> = async ({ params }) => {
  const data = await axios.get(
    API_URL + '/galleries/' + params.username + '/' + params.projectSlug
  )

  return <div>{JSON.stringify(data.data)}</div>
}

export default GalleryPage
