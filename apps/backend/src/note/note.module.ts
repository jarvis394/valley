import { Module } from '@nestjs/common'
import { NoteService } from './note.service'
import { NoteController } from './note.controller'
import { UserService } from '../user/user.service'
import { ConfigService } from '../config/config.service'
import { TagService } from '../tag/tag.service'

@Module({
  providers: [NoteService, ConfigService, UserService, TagService],
  controllers: [NoteController],
})
export class NoteModule {}
