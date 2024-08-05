import { IsAlphanumeric, IsNotEmpty, IsString } from 'class-validator'

export class RegisterDto {
  @IsString({})
  @IsAlphanumeric('en-US')
  username: string

  @IsNotEmpty({ message: 'Password field is required' })
  password: string
}
