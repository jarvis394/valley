import { createFileRoute, getRouteApi, useNavigate, useRouter } from '@tanstack/react-router'
import { googleFontsHref } from '@valley/canvas'
import { useState } from 'react'
import { Greeting } from '../../../components/projects/greeting'
import { ProjectsPage } from '../../../components/projects/projects-page'
import { UploadDropzone } from '../../../components/projects/upload-dropzone'
import { GALLERY_SERVICE_URL } from '../../../config/constants'
import { api } from '../../../data/api'

const greetingFontHref = googleFontsHref(['google-sans-flex'])
const appRoute = getRouteApi('/_app')

export const Route = createFileRoute('/_app/projects/')({
  head: () => ({
    meta: [{ title: 'Projects · Valley' }],
    links: greetingFontHref ? [{ rel: 'stylesheet', href: greetingFontHref }] : [],
  }),
  component: Projects,
})

function Projects() {
  const { account, projects } = appRoute.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)

  // A promise chain, not try/finally, which React Compiler can't compile.
  const createProject = (files: File[]) => {
    setCreating(true)
    void api
      .createProject(files)
      .then(async (project) => {
        await router.invalidate()
        await navigate({ to: '/projects/$projectId', params: { projectId: project.id } })
      })
      .finally(() => setCreating(false))
  }

  return (
    <ProjectsPage
      projects={projects}
      galleryUrl={GALLERY_SERVICE_URL}
      hero={
        <>
          <Greeting name={account.name} />
          <UploadDropzone disabled={creating} onFiles={createProject} />
        </>
      }
    />
  )
}
