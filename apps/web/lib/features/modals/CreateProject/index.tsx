'use client'
import React from 'react'
import { Modal, ModalFooter, ModalHeader } from '..'
import Button from '@valley/ui/Button'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const CreateProjectModal = ({ isOpen }: { isOpen: boolean }) => {
  const router = useRouter()
  const pathname = usePathname()
  const query = useSearchParams()

  const handleClose = () => {
    const newQuery = new URLSearchParams(query.toString())
    newQuery.delete('modal')

    router.push(pathname + '?' + newQuery.toString())
  }

  return (
    <Modal isOpen={isOpen}>
      <ModalHeader>Create Project</ModalHeader>
      <ModalFooter
        before={
          <Button onClick={handleClose} variant="secondary-dimmed" size="md">
            Cancel
          </Button>
        }
        after={
          <Button variant="primary" size="md">
            Create
          </Button>
        }
      />
    </Modal>
  )
}

export default CreateProjectModal
