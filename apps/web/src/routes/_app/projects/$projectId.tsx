import { createFileRoute, getRouteApi, Link, notFound } from '@tanstack/react-router'
import { createEditor } from '@valley/canvas'
import { Menu } from '@valley/ui'
import { useEffect, useState } from 'react'
import { ProjectActions, ProjectNav } from '../../../components/editor/project-chrome'
import { ProjectEditor } from '../../../components/editor/project-editor'
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
  component: ProjectRoute,
})

function ProjectRoute() {
  const project = Route.useLoaderData()
  return <ProjectWorkspace key={project.id} project={project} />
}

function ProjectWorkspace({ project }: { project: Project }) {
  const { projects } = appRoute.useLoaderData()
  const [editor] = useState(() =>
    createEditor({
      doc: project.doc,
      settings: project.settings,
      registry,
      galleryUrl: GALLERY_SERVICE_URL,
    }),
  )

  // oxlint-disable-next-line valley/no-unreasoned-state-sync -- subscribes the store to the backend
  useEffect(() => api.syncProject(project.id, editor), [project.id, editor])

  return (
    <ProjectEditor
      editor={editor}
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
