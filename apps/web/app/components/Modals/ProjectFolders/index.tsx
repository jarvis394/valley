import {
  useSensors,
  useSensor,
  TouchSensor,
  KeyboardSensor,
  DragEndEvent,
  DndContext,
  closestCenter,
  MouseSensor,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  sortableKeyboardCoordinates,
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  FetcherWithComponents,
  useFetcher,
  useNavigate,
} from '@remix-run/react'
import type { Folder } from '@valley/db'
import { ProjectWithFolders, PROJECT_MAX_FOLDERS } from '@valley/shared'
import Button from '@valley/ui/Button'
import Stack from '@valley/ui/Stack'
import ModalFooter from '@valley/ui/ModalFooter'
import ModalHeader from '@valley/ui/ModalHeader'
import FolderListItem from 'app/components/FolderListItem/FolderListItem'
import { Plus, Pencil } from 'geist-ui-icons'
import React, { useState, useId, startTransition, useMemo } from 'react'
import cx from 'classnames'
import styles from './ProjectFoldersModal.module.css'
import { createPortal } from 'react-dom'
import { ClientOnly } from 'remix-utils/client-only'
import { useProject } from 'app/utils/project'
import { useProjectsStore } from 'app/stores/projects'

const ModalContent: React.FC<{
  project?: ProjectWithFolders | null
  createFolderFetcher: FetcherWithComponents<unknown>
  onClose?: () => void
}> = ({ project: propsProject, createFolderFetcher }) => {
  const id = useId()
  const navigate = useNavigate()
  const storeProject = useProjectsStore(
    (state) => state.projects[propsProject?.id || '']
  )
  const setProjectFolders = useProjectsStore((state) => state.setProjectFolders)
  const parsedStoreProject = useMemo(() => {
    const res: ProjectWithFolders = { ...storeProject, folders: [] }
    if (!storeProject) return propsProject
    for (const id in storeProject.folders) {
      const folder = storeProject.folders[id]
      folder && res.folders.push(folder)
    }
    return res
  }, [propsProject, storeProject])
  const project = parsedStoreProject || propsProject
  const folders = project?.folders || []
  const [activeFolderId, setActiveFolderId] = useState<Folder['id'] | null>(
    null
  )
  const activeFolder = folders.find((e) => e.id === activeFolderId)
  const [isEditing, setIsEditing] = useState(false)
  const isCreatingFolder = createFolderFetcher.state !== 'idle'
  const canCreateMoreFolders = (folders.length || 0) < PROJECT_MAX_FOLDERS
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleFolderClick = (folder: Folder) => {
    if (!project) return

    navigate('/projects/' + project.id + '/folder/' + folder.id)
  }

  const handleEdit = () => {
    startTransition(() => {
      setIsEditing((prev) => !prev)
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveFolderId(event.active.id.toString())
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (!project) return

    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = folders.findIndex((e) => e.id === active.id)
      const newIndex = folders.findIndex((e) => e.id === over?.id)
      setProjectFolders(project?.id, arrayMove(folders, oldIndex, newIndex))
    }
  }

  return (
    <>
      <ModalHeader style={{ paddingTop: 24, paddingBottom: 12 }}>
        <Stack fullWidth align={'center'} justify={'space-between'}>
          Folders
          <Stack gap={2}>
            <Button
              disabled={isCreatingFolder}
              loading={isCreatingFolder}
              variant="secondary"
              size="md"
              type="submit"
              form="create-project-folder"
              className="fade"
              data-fade-in={canCreateMoreFolders}
              before={<Plus />}
            >
              Create
            </Button>
            <Button
              onClick={handleEdit}
              variant={isEditing ? 'secondary' : 'primary'}
              before={isEditing ? null : <Pencil />}
              size="md"
            >
              {isEditing && 'Done'}
              {!isEditing && 'Edit'}
            </Button>
          </Stack>
        </Stack>
      </ModalHeader>
      <Stack
        className={styles.project__foldersModalStack}
        gap={1}
        direction={'column'}
        padding={2}
        fullWidth
        asChild
      >
        <ul>
          <DndContext
            id={id}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
          >
            <SortableContext
              disabled={!isEditing}
              items={folders}
              strategy={verticalListSortingStrategy}
            >
              {folders.map((folder) => (
                <FolderListItem
                  mode={isEditing ? 'edit' : 'default'}
                  key={folder.id}
                  onClick={handleFolderClick}
                  folder={folder}
                />
              ))}
              <ClientOnly>
                {() =>
                  createPortal(
                    <DragOverlay zIndex={2000}>
                      {activeFolderId && activeFolder && (
                        <FolderListItem
                          mode="edit"
                          isOverlay
                          key={activeFolderId}
                          folder={activeFolder}
                        />
                      )}
                    </DragOverlay>,
                    document.body
                  )
                }
              </ClientOnly>
            </SortableContext>
          </DndContext>
        </ul>
      </Stack>
      <ModalFooter className={styles.project__foldersModalFooter}>
        <p
          data-fade-in={isEditing}
          className={cx(styles.project__foldersModalFooterText, 'fade')}
        >
          Exit editing mode by clicking &quot;Done&quot;
        </p>
        <p
          data-fade-in={!isEditing}
          className={cx(styles.project__foldersModalFooterText, 'fade')}
        >
          You can edit folders by clicking &quot;Edit&quot; button
        </p>
      </ModalFooter>
    </>
  )
}

const ProjectFoldersModal: React.FC<{ onClose?: () => void }> = ({
  onClose,
}) => {
  const project = useProject()
  const createFolderAction = '/api/folders/create'
  const createFolderFetcher = useFetcher({ key: createFolderAction })

  return (
    <ModalContent
      createFolderFetcher={createFolderFetcher}
      onClose={onClose}
      project={project}
    />
  )
}

export default React.memo(ProjectFoldersModal)
