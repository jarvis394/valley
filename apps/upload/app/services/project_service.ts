import { Project, File, projects, eq, covers } from '@valley/db'
import type { SerializedProject } from '@valley/shared'
import db from '#services/database_service'

export default class ProjectService {
  async addFilesToProject(
    projectId: Project['id'],
    files: File[]
  ): Promise<SerializedProject | null> {
    return await db.transaction(async (tx) => {
      const [[project], [cover]] = await Promise.all([
        tx
          .select()
          .from(projects)
          .where(eq(projects.id, projectId))
          .for('update'),
        tx.select().from(covers).where(eq(covers.projectId, projectId)),
      ])
      const possibleCoverFile = files.find((e) => e.canHaveThumbnails)
      const shouldCreateCover = !cover && possibleCoverFile

      if (!project) {
        return null
      }

      let allFilesSize = 0
      files.forEach((file) => {
        allFilesSize += Number(file.size)
      })

      const newProjectTotalFiles = project.totalFiles + files.length
      const newProjectTotalSize = Number(project.totalSize) + allFilesSize
      const updateProjectPromise = tx
        .update(projects)
        .set({
          totalFiles: newProjectTotalFiles,
          totalSize: newProjectTotalSize.toString(),
        })
        .where(eq(projects.id, projectId))
        .returning()
      const createFolderPromise =
        shouldCreateCover &&
        tx.insert(covers).values({
          projectId,
          fileId: possibleCoverFile.id,
        })
      const [[newProjectData]] = await Promise.all([
        updateProjectPromise,
        createFolderPromise,
      ])

      return ProjectService.serializeProject(newProjectData)
    })
  }

  static serializeProject(project: Project): SerializedProject {
    return {
      ...project,
      totalSize: Number(project.totalSize),
    }
  }
}
