import { IsAlphanumeric, IsNotEmpty, IsString } from 'class-validator'

export class LoginDto {
  @IsString()
  @IsAlphanumeric()
  username: string

  @IsNotEmpty({ message: 'Password field is required' })
  password: string
}
