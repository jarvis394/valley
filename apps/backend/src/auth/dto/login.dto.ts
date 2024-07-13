import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class LoginDto {
  @ApiProperty({
    description: 'User email',
  })
  @IsEmail({}, { message: 'Email field is invalid' })
  email: string

  @ApiProperty({
    description: 'User password',
  })
  @IsNotEmpty({ message: 'Password field is required' })
  password: string
}
