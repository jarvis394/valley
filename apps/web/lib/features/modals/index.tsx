'use client'
import { useMemo } from 'react'
import CreateProjectModal from './CreateProject'
import { useSearchParams } from 'next/navigation'

export const Modals = () => {
  const query = useSearchParams()
  const modal = useMemo(() => query.get('modal'), [query])

  return <CreateProjectModal isOpen={modal === 'create-project'} />
}

export * from './components'
