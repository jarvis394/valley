import {
  db,
  folders,
  projects,
  and,
  asc,
  desc,
  eq,
  type Project,
  type User,
  covers,
  File,
} from '@valley/db'
import { ProjectWithFolders, SerializedProject } from '@valley/shared'

export class ProjectService {
  static getUserProjects({
    userId,
  }: {
    userId: User['id']
  }): Promise<ProjectWithFolders[]> {
    return db.query.projects.findMany({
      orderBy: desc(projects.createdAt),
      where: eq(projects.userId, userId),
      with: {
        folders: true,
        cover: {
          with: { file: true },
        },
      },
    })
  }

  static getUserProject({
    userId,
    projectId,
  }: {
    userId: User['id']
    projectId: Project['id']
  }): Promise<ProjectWithFolders | undefined> {
    return db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
      with: {
        folders: {
          orderBy: asc(folders.createdAt),
        },
        cover: {
          with: { file: true },
        },
      },
    })
  }

  static updateUserProject(data: {
    userId: User['id']
    projectId: Project['id']
    data: Partial<Project>
  }) {
    return db
      .update(projects)
      .set(data.data)
      .where(
        and(eq(projects.id, data.projectId), eq(projects.userId, data.userId))
      )
  }

  static async addFilesToProject(
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
