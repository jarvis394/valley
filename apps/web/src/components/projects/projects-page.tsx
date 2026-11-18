import { ScrollArea } from '@valley/ui'
import type { ReactNode } from 'react'
import type { ProjectSummary } from '../../data/api'
import { ProjectCard } from './project-card'

export function ProjectsPage({
  hero,
  projects,
  galleryUrl,
  onDelete,
}: {
  hero: ReactNode
  projects: ProjectSummary[]
  galleryUrl: string
  onDelete: (id: string) => Promise<void>
}) {
  return (
    <ScrollArea render={<main />} scrollbar="plain" className="@container h-full min-w-0 flex-1">
      <div className="flex flex-col items-center gap-8 px-4 pt-24 pb-8 lg:pt-45">{hero}</div>
      <ul className="mx-auto grid max-w-350 grid-cols-1 gap-2 px-4 pb-8 @lg:grid-cols-2 @4xl:grid-cols-3 @7xl:grid-cols-4">
        {projects.map((project) => (
          <li key={project.id}>
            <ProjectCard
              project={project}
              galleryUrl={galleryUrl}
              onDelete={() => onDelete(project.id)}
            />
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}
