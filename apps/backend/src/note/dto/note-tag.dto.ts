import { AddNoteTagReq } from '@app/shared'
import { ApiProperty } from '@nestjs/swagger'
import { Tag } from '@prisma/client'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class NoteTagDto implements AddNoteTagReq {
  @ApiProperty({
    description: 'Tag ID',
  })
  @IsNumber()
  @IsNotEmpty()
  tagId: Tag['id']
}
