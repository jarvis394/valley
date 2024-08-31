import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common'
import { BaseTusHookResponseErrorBody, TusHookData } from '@valley/shared'
import { RequestWithUser } from 'src/auth/auth.controller'
import { ProjectsService } from 'src/projects/projects.service'
import { TusHookResponseBuilder } from '../upload.service'

@Injectable()
export class UploadAccessGuard implements CanActivate {
  constructor(private readonly projectsService: ProjectsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>()
    const body = request.body as unknown as TusHookData
    const userId = request.user.userId
    const projectId = body?.Event?.Upload?.MetaData?.['project-id']
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
      .build()

    if (!projectId) {
      return true
    }

    const project = await this.projectsService.getUserProject(
      userId,
      Number(projectId)
    )

    if (!project || project.userId !== userId) {
      throw new NotFoundException(res)
    }

    return true
  }
}
