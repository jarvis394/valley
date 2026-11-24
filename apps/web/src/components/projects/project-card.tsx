import { Link } from '@tanstack/react-router'
import { formatLongDate } from '@valley/canvas'
import {
  Button,
  ButtonGroup,
  CopyButton,
  EyeIcon,
  FileIcon,
  IconButton,
  LinkIcon,
  LockClosedIcon,
  Menu,
  MoreIcon,
  useCopy,
} from '@valley/ui'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { ProjectSummary } from '../../data/api'
import { formatGrouped } from '../../lib/format'
import { DeleteProjectDialog } from './delete-project-dialog'

/**
 * The title link stretches over the whole card. Controls sit in `relative z-10` wrappers
 * so they stay clickable above it.
 */
export function ProjectCard({
  project,
  galleryUrl,
  onDelete,
}: {
  project: ProjectSummary
  galleryUrl: string
  onDelete: () => Promise<void>
}) {
  const { copy } = useCopy()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const shareUrl = project.slug && `${galleryUrl}/${project.slug}`

  const copyLink = () => shareUrl && void copy(shareUrl)

  return (
    <article className="relative flex flex-col overflow-hidden rounded-[22px] border-[0.5px] border-white/3 bg-linear-to-b from-white/3 to-white/7 backdrop-blur-2xl">
      <p className="px-3 py-2.5 text-small font-medium text-fg/32">
        {formatLongDate(project.date)}
      </p>
      {project.thumbnail ? (
        <img src={project.thumbnail} alt="" className="h-53 w-full object-cover" />
      ) : (
        <div className="flex h-53 flex-col items-center justify-center gap-0.5 border-y-[0.5px] border-white/3 text-white">
          <p className="text-title font-medium">Seems empty, doesn’t it?</p>
          <p className="text-small opacity-63">Add more files inside the project</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5 px-3 pt-3 pb-2.5">
        <h2 className="truncate text-heading font-medium">
          <Link
            to="/projects/$projectId"
            params={{ projectId: project.id }}
            className="outline-none after:absolute after:inset-0 after:rounded-[22px] focus-visible:after:ring-2 focus-visible:after:ring-accent/60"
          >
            {project.title}
          </Link>
        </h2>
        {project.visibility === 'public' && shareUrl ? (
          <div className="flex h-8 items-center gap-2.5">
            <LinkIcon opacity={0.63} />
            <span className="min-w-0 flex-1 truncate text-title font-medium">/{project.slug}</span>
            <span className="relative z-10 flex">
              <CopyButton
                variant="outline"
                value={shareUrl}
                label="Copy link"
                copiedLabel="Link copied"
              />
            </span>
          </div>
        ) : (
          <div className="flex h-8 items-center gap-2.5 text-fg/63">
            <LockClosedIcon />
            <span className="min-w-0 flex-1 truncate text-title font-medium">
              Project is private
            </span>
          </div>
        )}
      </div>

      <ButtonGroup className="relative z-10 px-3 pb-3">
        <Button variant="outline" icon={<FileIcon />} className="flex-1">
          {project.files} {project.files === 1 ? 'file' : 'files'}
        </Button>
        <Button variant="outline" icon={<EyeIcon />} aria-label="Views">
          {formatGrouped(project.views)}
        </Button>
        <Menu.Root>
          <Menu.Trigger render={<IconButton variant="outline" aria-label="Project actions" />}>
            <MoreIcon />
          </Menu.Trigger>
          <Menu.Popup>
            <Menu.Item
              render={<Link to="/projects/$projectId" params={{ projectId: project.id }} />}
            >
              Open project
            </Menu.Item>
            {shareUrl && <Menu.Item onClick={copyLink}>Copy link</Menu.Item>}
            <Menu.Separator />
            <Menu.Item
              variant="danger"
              icon={<Trash2 className="size-4" />}
              onClick={() => setConfirmingDelete(true)}
            >
              Delete project
            </Menu.Item>
          </Menu.Popup>
        </Menu.Root>
      </ButtonGroup>
      <DeleteProjectDialog
        title={project.title}
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        onDelete={onDelete}
      />
    </article>
  )
}
