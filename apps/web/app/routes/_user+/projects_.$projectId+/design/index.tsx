import Divider from '@valley/ui/Divider'
import PageHeader from 'app/components/PageHeader/PageHeader'
import React, { useState } from 'react'
import { Route } from './+types'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { getValidatedFormData } from 'remix-hook-form'
import { data } from 'react-router'
import {
  deleteCover,
  updateCoverPosition,
  updateCoverVariant,
  updateGalleryOrientation,
  updateGallerySpacing,
  updateGalleryTheme,
  updateHeadingFont,
} from './design.server'
import {
  ProjectCoverVariant,
  ProjectGalleryOrientation,
  ProjectGallerySpacing,
  ProjectGalleryTheme,
  ProjectHeadingFont,
} from '@valley/db/config/constants'
import ProjectDesignSettings from './ProjectDesignSettings'
import { PreviewOnDevices } from '@valley/gallery-module/preview-on-devices'
import { MobilePreview } from '@valley/gallery-module/mobile-preview'
import { useProject } from 'app/utils/project'
import { useTheme } from 'app/routes/resources+/theme-switch'
import { useCoversStore } from 'app/stores/covers'
import { useHints } from 'app/components/ClientHints/ClientHints'
import Button from '@valley/ui/Button'
import Modal from '@valley/ui/Modal'

const ProjectDesignDeleteCoverSchema = z.object({
  intent: z.enum(['delete-cover']),
})

const ProjectDesignCoverPositionSchema = z.object({
  intent: z.enum(['cover-position']),
  x: z.number(),
  y: z.number(),
})

const ProjectDesignHeadingFontSchema = z.object({
  intent: z.enum(['heading-font']),
  value: z.nativeEnum(ProjectHeadingFont),
})

const ProjectDesignCoverVariantSchema = z.object({
  intent: z.enum(['cover-variant']),
  value: z.nativeEnum(ProjectCoverVariant),
})

const ProjectDesignGalleryOrientationSchema = z.object({
  intent: z.enum(['gallery-orientation']),
  value: z.nativeEnum(ProjectGalleryOrientation),
})

const ProjectDesignGallerySpacingSchema = z.object({
  intent: z.enum(['gallery-spacing']),
  value: z.nativeEnum(ProjectGallerySpacing),
})

const ProjectDesignGalleryThemeSchema = z.object({
  intent: z.enum(['gallery-theme']),
  value: z.nativeEnum(ProjectGalleryTheme),
})

export const ProjectDesignSchema = z.union([
  ProjectDesignDeleteCoverSchema,
  ProjectDesignCoverPositionSchema,
  ProjectDesignHeadingFontSchema,
  ProjectDesignCoverVariantSchema,
  ProjectDesignGalleryOrientationSchema,
  ProjectDesignGallerySpacingSchema,
  ProjectDesignGalleryThemeSchema,
])

type FormData = z.infer<typeof ProjectDesignSchema>

const resolver = zodResolver(ProjectDesignSchema)

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { projectId } = params
  const {
    errors,
    data: submissionData,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver)
  if (errors) {
    return data(
      { ok: false, errors, defaultValues },
      {
        status: 400,
      }
    )
  }

  try {
    switch (submissionData.intent) {
      case 'delete-cover':
        await deleteCover(projectId)
        break
      case 'cover-position':
        await updateCoverPosition(submissionData, projectId)
        break
      case 'heading-font':
        await updateHeadingFont(submissionData.value, projectId)
        break
      case 'cover-variant':
        await updateCoverVariant(submissionData.value, projectId)
        break
      case 'gallery-orientation':
        await updateGalleryOrientation(submissionData.value, projectId)
        break
      case 'gallery-spacing':
        await updateGallerySpacing(submissionData.value, projectId)
        break
      case 'gallery-theme':
        await updateGalleryTheme(submissionData.value, projectId)
        break
      default:
        throw new Response('Invalid intent', {
          status: 400,
        })
    }
  } catch (e) {
    if (e instanceof Response) {
      throw e
    } else {
      console.error(e)
      throw new Response('Unknown Server Error', {
        status: 500,
      })
    }
  }

  return { ok: true }
}

const ProjectDesignRoute: React.FC<Route.ComponentProps> = () => {
  const [isMobilePreviewOpen, setMobilePreviewOpen] = useState(false)
  const project = useProject()
  const cover = project.cover
  const position = useCoversStore((state) => state.covers[project.id])
  const theme = useTheme()
  const hints = useHints()
  const resolvedTheme =
    project.galleryTheme === 'system' ? theme : project.galleryTheme

  const openMobilePreview = () => {
    setMobilePreviewOpen(true)
  }

  return (
    <>
      <PageHeader
        after={
          <div className="md:hidden">
            <Button onClick={openMobilePreview} size="lg">
              Preview
            </Button>
          </div>
        }
      >
        Project Design
      </PageHeader>
      <Divider />
      <div className="flex h-full flex-row">
        <ProjectDesignSettings />
        <div className="border-alpha-transparent-12 sticky top-13 flex h-[calc(100dvh-52px)] w-full items-center justify-center max-md:relative max-md:top-0 max-md:hidden max-md:h-64 max-md:border-b-1 md:border-l-1">
          {cover && (
            <PreviewOnDevices
              project={project}
              timeZone={hints.timeZone}
              cover={cover}
              position={position}
              theme={resolvedTheme}
            />
          )}
        </div>
      </div>
      {cover && (
        <Modal isOpen={isMobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
          <div className="m-4 h-[75vh] overflow-hidden rounded-2xl">
            <MobilePreview
              project={project}
              timeZone={hints.timeZone}
              cover={cover}
              position={position}
              theme={resolvedTheme}
            />
          </div>
        </Modal>
      )}
    </>
  )
}

export default ProjectDesignRoute
