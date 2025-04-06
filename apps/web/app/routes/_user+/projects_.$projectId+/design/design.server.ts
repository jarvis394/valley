import { db, covers, eq, Project, projects } from '@valley/db'
import {
  ProjectHeadingFont,
  ProjectCoverVariant,
  ProjectGalleryOrientation,
  ProjectGallerySpacing,
  ProjectGalleryTheme,
} from '@valley/db/config/constants'

export const deleteCover = async (projectId: Project['id']) => {
  return await db.delete(covers).where(eq(covers.projectId, projectId))
}

export const updateCoverPosition = async (
  position: {
    x: number
    y: number
  },
  projectId: Project['id']
) => {
  return await db
    .update(covers)
    .set(position)
    .where(eq(covers.projectId, projectId))
}

export const updateHeadingFont = async (
  headingFont: ProjectHeadingFont,
  projectId: Project['id']
) => {
  return await db
    .update(projects)
    .set({
      headingFont,
    })
    .where(eq(projects.id, projectId))
}

export const updateCoverVariant = async (
  coverVariant: ProjectCoverVariant,
  projectId: Project['id']
) => {
  return await db
    .update(projects)
    .set({
      coverVariant,
    })
    .where(eq(projects.id, projectId))
}

export const updateGalleryOrientation = async (
  galleryOrientation: ProjectGalleryOrientation,
  projectId: Project['id']
) => {
  return await db
    .update(projects)
    .set({
      galleryOrientation,
    })
    .where(eq(projects.id, projectId))
}

export const updateGallerySpacing = async (
  gallerySpacing: ProjectGallerySpacing,
  projectId: Project['id']
) => {
  return await db
    .update(projects)
    .set({
      gallerySpacing,
    })
    .where(eq(projects.id, projectId))
}

export const updateGalleryTheme = async (
  galleryTheme: ProjectGalleryTheme,
  projectId: Project['id']
) => {
  return await db
    .update(projects)
    .set({
      galleryTheme,
    })
    .where(eq(projects.id, projectId))
}
