import { createFileRoute } from '@tanstack/react-router'
import {
  CanvasEditor,
  createDefaultRegistry,
  createEditor,
  persistEditor,
  sampleDocument,
  sampleSettings,
} from '@valley/canvas'
import { useEffect, useState } from 'react'
import { AppSidebar, ProjectActions, ProjectNav } from '../components/app-chrome'
import { GALLERY_SERVICE_URL } from '../config/constants'

export const Route = createFileRoute('/')({
  component: Home,
})

// Bump when the sample document changes shape so stale demos don't shadow it.
const STORAGE_KEY = 'valley.canvas.demo.v3'
const registry = createDefaultRegistry()

function Home() {
  const [editor] = useState(() =>
    createEditor({
      doc: sampleDocument,
      settings: sampleSettings,
      registry,
      galleryUrl: GALLERY_SERVICE_URL,
    }),
  )

  // oxlint-disable-next-line valley/no-unreasoned-state-sync -- localStorage is only readable after hydration
  useEffect(() => persistEditor(editor, STORAGE_KEY), [editor])

  return (
    <CanvasEditor
      editor={editor}
      sidebar={<AppSidebar />}
      nav={<ProjectNav />}
      actions={<ProjectActions />}
    />
  )
}
