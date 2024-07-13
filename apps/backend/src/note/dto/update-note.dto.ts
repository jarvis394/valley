import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdateNoteDto {
  @ApiProperty({
    description: 'Note title',
  })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({
    description: 'Note description',
  })
  @IsOptional()
  @IsString()
  markdown?: string
}
