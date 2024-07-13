import { CreateTagReq } from '@app/shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateTagDto implements CreateTagReq {
  @ApiProperty({
    description: 'Tag label',
  })
  @IsString()
  @IsNotEmpty()
  label: string

  @ApiProperty({
    description: 'Tag icon',
  })
  @IsOptional()
  @IsString()
  icon: string | null
}
