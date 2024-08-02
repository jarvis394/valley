import {
  Controller,
  Get,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
} from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { RequestWithUser } from '../auth/auth.controller'
import { ProjectGetAllRes, ProjectGetRes } from '@valley/shared'

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getUserProjects(
    @Request() req: RequestWithUser
  ): Promise<ProjectGetAllRes> {
    const projects = await this.projectsService.getUserProjects(req.user.userId)
    return { projects }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getProject(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) projectId: number
  ): Promise<ProjectGetRes> {
    const project = await this.projectsService.getUserProject(
      req.user.userId,
      projectId
    )
    return { project }
  }
}
