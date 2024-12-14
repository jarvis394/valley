import {
  useSensors,
  useSensor,
  TouchSensor,
  KeyboardSensor,
  DragEndEvent,
  DndContext,
  closestCenter,
  MouseSensor,
} from '@dnd-kit/core'
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers'
import {
  sortableKeyboardCoordinates,
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { FetcherWithComponents, useNavigate } from '@remix-run/react'
import { Folder } from '@valley/db'
import { ProjectWithFolders, PROJECT_MAX_FOLDERS } from '@valley/shared'
import Button from '@valley/ui/Button'
import Stack from '@valley/ui/Stack'
import Modal from '@valley/ui/Modal'
import ModalFooter from '@valley/ui/ModalFooter'
import ModalHeader from '@valley/ui/ModalHeader'
import FolderListItem from 'app/components/FolderListItem/FolderListItem'
import { Plus, Pencil } from 'geist-ui-icons'
import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import styles from './ProjectFoldersModal.module.css'

const ProjectFoldersModal: React.FC<{
  project: ProjectWithFolders | null
  createFolderFetcher: FetcherWithComponents<unknown>
  isOpen?: boolean
  onDismiss?: () => void
}> = ({ project, isOpen, createFolderFetcher, onDismiss }) => {
  const navigate = useNavigate()
  const [folders, setFolders] = useState(project?.folders || [])
  const [isEditing, setIsEditing] = useState(false)
  const isCreatingFolder = createFolderFetcher.state !== 'idle'
  const canCreateMoreFolders = (folders.length || 0) < PROJECT_MAX_FOLDERS
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleFolderClick = (folder: Folder) => {
    if (!project) return

    onDismiss?.()
    navigate('/projects/' + project.id + '/folder/' + folder.id)
    setIsEditing(false)
  }

  const handleEdit = () => {
    setIsEditing((prev) => !prev)
  }

  const handleDismiss = () => {
    setIsEditing(false)
    onDismiss?.()
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setFolders((prevFolders) => {
        const oldIndex = prevFolders.findIndex((e) => e.id === active.id)
        const newIndex = prevFolders.findIndex((e) => e.id === over?.id)

        return arrayMove(prevFolders, oldIndex, newIndex)
      })
    }
  }

  useEffect(() => {
    setFolders(project?.folders || [])
  }, [project?.folders])

  return (
    <Modal
      id="project-folders-list"
      onDismiss={handleDismiss}
      isOpen={isOpen}
      handleOnly
    >
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
        gap={isEditing ? 1 : 0}
        direction={'column'}
        padding={2}
        fullWidth
        asChild
      >
        <ul>
          <DndContext
            sensors={sensors}
            modifiers={[restrictToFirstScrollableAncestor]}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
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
                  onFolderRename={handleDismiss}
                  onFolderDelete={handleDismiss}
                  folder={folder}
                />
              ))}
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
    </Modal>
  )
}

export default React.memo(ProjectFoldersModal)
