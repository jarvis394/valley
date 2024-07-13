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
import { NoteService } from './note.service'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { RequestWithUser } from '../auth/auth.controller'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
  NoteGetAllRes,
  NoteGetRes,
  NoteDeleteRes,
  CreateNoteRes,
  UpdateNoteRes,
  AddNoteTagRes,
  RemoveNoteTagRes,
} from '@app/shared'
import { CreateNoteDto } from './dto/create-note.dto'
import { UpdateNoteDto } from './dto/update-note.dto'
import { NoteTagDto } from './dto/note-tag.dto'

@ApiTags('note')
@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  @ApiBearerAuth()
  async getNotes(@Request() req: RequestWithUser): Promise<NoteGetAllRes> {
    const notes = await this.noteService.notes({
      where: {
        userId: req.user.userId,
      },
    })
    return { notes }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  async getNote(
    @Request() req: RequestWithUser,
    @Param('id') id: string
  ): Promise<NoteGetRes> {
    const note = await this.noteService.note({
      id: Number(id),
      userId: req.user.userId,
    })
    return { note }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  async delete(
    @Request() req: RequestWithUser,
    @Param('id') id: string
  ): Promise<NoteDeleteRes> {
    await this.noteService.deleteNote({
      id: Number(id),
      userId: req.user.userId,
    })
    return { ok: true }
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiBearerAuth()
  async createNote(
    @Request() req: RequestWithUser,
    @Body() data: CreateNoteDto
  ): Promise<CreateNoteRes> {
    const note = await this.noteService.createNoteFromDTO(req.user.userId, data)
    return { note }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/update')
  @ApiBearerAuth()
  async updateNote(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() data: UpdateNoteDto
  ): Promise<UpdateNoteRes> {
    const note = await this.noteService.updateNote({
      where: {
        id: Number(id),
        userId: req.user.userId,
      },
      data,
    })
    return { note }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/addTag')
  @ApiBearerAuth()
  async addNoteTag(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() data: NoteTagDto
  ): Promise<AddNoteTagRes> {
    const note = await this.noteService.addNoteTag({
      noteId: Number(id),
      userId: req.user.userId,
      tagId: data.tagId,
    })
    return { note }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/removeTag')
  @ApiBearerAuth()
  async removeNoteTag(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() data: NoteTagDto
  ): Promise<RemoveNoteTagRes> {
    const note = await this.noteService.removeNoteTag({
      noteId: Number(id),
      userId: req.user.userId,
      tagId: data.tagId,
    })
    return { note }
  }
}
