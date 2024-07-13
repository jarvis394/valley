import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { RequestWithUser } from '../auth/auth.controller'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
  TagGetAllRes,
  TagGetRes,
  TagDeleteRes,
  UpdateTagRes,
  CreateTagRes,
} from '@app/shared'
import { CreateTagDto } from './dto/create-tag.dto'
import { TagService } from './tag.service'

@ApiTags('tag')
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  @ApiBearerAuth()
  async getTags(@Request() req: RequestWithUser): Promise<TagGetAllRes> {
    const tags = await this.tagService.tags({
      where: {
        userId: req.user.userId,
      },
    })
    return { tags }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  async getTag(
    @Request() req: RequestWithUser,
    @Param('id') id: string
  ): Promise<TagGetRes> {
    const tag = await this.tagService.tag({
      id: Number(id),
      userId: req.user.userId,
    })
    return { tag }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  async deleteTag(
    @Request() req: RequestWithUser,
    @Param('id') id: string
  ): Promise<TagDeleteRes> {
    await this.tagService.deleteTag({ id: Number(id), userId: req.user.userId })
    return { ok: true }
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiBearerAuth()
  async createTag(
    @Request() req: RequestWithUser,
    @Body() data: CreateTagDto
  ): Promise<CreateTagRes> {
    const tag = await this.tagService.createTag(req.user.userId, data)
    return { tag }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/update')
  @ApiBearerAuth()
  async updateTag(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() data: CreateTagDto
  ): Promise<UpdateTagRes> {
    const tag = await this.tagService.updateTag({
      data,
      where: {
        id: Number(id),
        userId: req.user.userId,
      },
    })
    return { tag }
  }
}
