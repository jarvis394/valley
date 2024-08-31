import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import type {
  ProjectCreateReq,
  ProjectCreateRes,
  ProjectGetAllRes,
  ProjectGetRes,
} from '@valley/shared'
import type { RequestWithUser } from '../auth/auth.controller'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { ProjectsService } from './projects.service'
import { FoldersService } from 'src/folders/folders.service'

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly foldersService: FoldersService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getUserProjects(
    @Request() req: RequestWithUser
  ): Promise<ProjectGetAllRes> {
    const projects = await this.projectsService.getUserProjects(req.user.userId)
    return { projects }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':projectId')
  async getProject(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number
  ): Promise<ProjectGetRes> {
    const [project, folders] = await Promise.all([
      this.projectsService.getUserProject(req.user.userId, projectId),
      this.foldersService.getProjectFolders(projectId),
    ])
    return { project, folders }
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createProject(
    @Request() req: RequestWithUser,
    @Body() data: ProjectCreateReq
  ): Promise<ProjectCreateRes> {
    const project = await this.projectsService.createProjectForUser(
      data,
      req.user.userId
    )
    const folder = await this.foldersService.createDefaultProjectFolder({
      projectId: project.id,
      userId: req.user.userId,
    })
    return { project, folders: [folder] }
  }
}
