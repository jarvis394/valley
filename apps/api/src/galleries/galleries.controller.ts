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
import { GalleriesService } from './galleries.service'
import { FoldersService } from '../folders/folders.service'

@Controller('galleries')
export class GalleriesController {
  constructor(private readonly galleriesService: GalleriesService) {}

  @Get('/:username/:slug')
  async getUserProjects(
    @Param('username') username: string,
    @Param('slug') slug: string
  ) {
    const data = await this.galleriesService.getGallery(username, slug)
    await new Promise((res) =>
      setTimeout(() => {
        res(null)
      }, 1000)
    )
    return data
  }
}
