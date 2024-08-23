'use client'
import { useMemo } from 'react'
import CreateProjectModal from './CreateProject'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export const Modals = () => {
  const query = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const modal = useMemo(() => query.get('modal'), [query])

  const handleClose = () => {
    const newQuery = new URLSearchParams(query.toString())
    newQuery.delete('modal')

    router.push(pathname + '?' + newQuery.toString())
  }

  return (
    modal === 'create-project' && <CreateProjectModal onClose={handleClose} />
  )
}
