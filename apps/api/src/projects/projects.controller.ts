import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ProjectGetAllRes, ProjectGetRes } from '@valley/shared'
import type { RequestWithUser } from '../auth/auth.controller'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { ProjectsService } from './projects.service'

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
