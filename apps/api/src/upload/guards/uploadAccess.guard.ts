import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common'
import { BaseTusHookResponseErrorBody, TusHookData } from '@valley/shared'
import { RequestWithUser } from '../../auth/auth.controller'
import { TusHookResponseBuilder } from '../../lib/TusHookResponseBuilder'
import { ProjectsService } from '../../projects/projects.service'
import { FoldersService } from 'src/folders/folders.service'

@Injectable()
export class UploadAccessGuard implements CanActivate {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly foldersService: FoldersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>()
    const body = request.body as unknown as TusHookData
    const userId = request.user.userId
    const projectId = body?.Event?.Upload?.MetaData?.['project-id']
    const folderId = body?.Event?.Upload?.MetaData?.['folder-id']
    const eventType = body?.Type
    const res = new TusHookResponseBuilder<BaseTusHookResponseErrorBody>()
      .setRejectUpload(true)
      .setStatusCode(404)
      .setBody({
        type: eventType,
        ok: false,
        statusCode: 404,
        message: 'Project not found',
      })

    if (!projectId || !folderId) {
      return true
    }

    const project = await this.projectsService.getUserProject(
      userId,
      Number(projectId)
    )
    const folder = await this.foldersService.getProjectFolder({
      projectId: Number(projectId),
      folderId: Number(folderId),
    })

    if (!project || project.userId !== userId) {
      throw new NotFoundException(res.build())
    }

    if (!folder) {
      res.setBodyRecord('message', 'Folder not found')
      throw new NotFoundException(res.build())
    }

    return true
  }
}
