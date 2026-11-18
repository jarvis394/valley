import {
  createFileRoute,
  getRouteApi,
  Link,
  notFound,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { createEditor } from '@valley/canvas'
import { Menu } from '@valley/ui'
import { useEffect, useState } from 'react'
import { ProjectActions, ProjectNav } from '../../../components/editor/project-chrome'
import { ProjectEditor } from '../../../components/editor/project-editor'
import { ProjectEditorSkeleton } from '../../../components/editor/project-editor-skeleton'
import { GALLERY_SERVICE_URL } from '../../../config/constants'
import { api, type Project } from '../../../data/api'
import { registry } from '../../../lib/registry'

const appRoute = getRouteApi('/_app')

export const Route = createFileRoute('/_app/projects/$projectId')({
  loader: async ({ params }) => {
    const project = await api.getProject(params.projectId)
    if (!project) throw notFound()

    return project
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.title} · Valley` : 'Valley' }],
  }),
  // The panels show at once; the canvas fills in when the project arrives.
  pendingComponent: ProjectEditorSkeleton,
  pendingMs: 0,
  pendingMinMs: 0,
  component: ProjectRoute,
})

function ProjectRoute() {
  const project = Route.useLoaderData()

  return <ProjectWorkspace key={project.id} project={project} />
}

function ProjectWorkspace({ project }: { project: Project }) {
  const { projects } = appRoute.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()
  const [editor] = useState(() =>
    createEditor({
      doc: project.doc,
      settings: project.settings,
      registry,
      galleryUrl: GALLERY_SERVICE_URL,
      uploadAsset: api.uploadAsset(project.id),
    }),
  )

  // oxlint-disable-next-line valley/no-unreasoned-state-sync -- subscribes the store to the backend
  useEffect(() => api.syncProject(project.id, editor), [project.id, editor])

  // Leaves before refreshing loaders, which would otherwise reload this now-missing project.
  const deleteProject = () =>
    api
      .deleteProject(project.id)
      .then(() => navigate({ to: '/projects' }))
      .then(() => router.invalidate())

  return (
    <ProjectEditor
      editor={editor}
      onDelete={deleteProject}
      nav={<ProjectNav views={project.views} newFavorites={project.newFavorites} />}
      actions={<ProjectActions />}
      switcher={projects
        .filter((item) => item.id !== project.id)
        .map((item) => (
          <Menu.Item
            key={item.id}
            render={<Link to="/projects/$projectId" params={{ projectId: item.id }} />}
          >
            {item.title}
          </Menu.Item>
        ))}
    />
  )
}
