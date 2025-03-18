import { Project, File, projects, eq, covers } from '@valley/db'
import type { SerializedProject } from '@valley/shared'
import db from '#services/database_service'

export default class ProjectService {
  async addFilesToProject(
    projectId: Project['id'],
    files: File[]
  ): Promise<SerializedProject | null> {
    return await db.transaction(async (tx) => {
      const [{ projects: project, covers: cover }] = await tx
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .leftJoin(covers, eq(covers.projectId, projectId))
        .for('update')
      const shouldCreateCover = !cover

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
        .returning()
      const createFolderPromise =
        shouldCreateCover &&
        tx.insert(covers).values({
          projectId,
          fileId: files[0].id,
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
