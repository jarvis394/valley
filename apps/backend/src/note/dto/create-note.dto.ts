import { CreateNoteReq } from '@app/shared'
import { ApiProperty } from '@nestjs/swagger'
import { Tag } from '@prisma/client'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateNoteDto implements CreateNoteReq {
  @ApiProperty({
    description: 'Note title',
  })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({
    description: 'Note description',
  })
  @IsString()
  markdown: string

  @ApiProperty({
    description: 'Note tags',
  })
  @IsOptional()
  @IsArray()
  tags?: Array<Tag['id']>
}
