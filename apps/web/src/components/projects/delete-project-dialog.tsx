import { AlertDialog, Button } from '@valley/ui'
import { useState } from 'react'

/** Confirms a permanent project deletion and stays open, showing progress, until it finishes. */
export function DeleteProjectDialog({
  title,
  open,
  onOpenChange,
  onDelete,
}: {
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: () => Promise<void>
}) {
  const [deleting, setDeleting] = useState(false)
  const [failed, setFailed] = useState(false)

  const changeOpen = (next: boolean) => {
    if (deleting) return
    setFailed(false)
    onOpenChange(next)
  }
  const confirm = () => {
    setDeleting(true)
    setFailed(false)
    void onDelete()
      .then(() => onOpenChange(false))
      .catch(() => setFailed(true))
      .finally(() => setDeleting(false))
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={changeOpen}>
      <AlertDialog.Popup
        title={`Delete “${title}”?`}
        description={
          failed
            ? 'The project could not be deleted. Try again.'
            : 'The project and all its files will be permanently deleted. This cannot be undone.'
        }
      >
        <AlertDialog.Actions>
          <AlertDialog.Close render={<Button variant="secondary" size="md" disabled={deleting} />}>
            Cancel
          </AlertDialog.Close>
          <Button variant="danger" size="md" disabled={deleting} onClick={confirm}>
            {deleting ? 'Deleting…' : 'Delete project'}
          </Button>
        </AlertDialog.Actions>
      </AlertDialog.Popup>
    </AlertDialog.Root>
  )
}
