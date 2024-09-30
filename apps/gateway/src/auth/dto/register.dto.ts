import {
  IsAlphanumeric,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

export class RegisterDto {
  @MinLength(4)
  @MaxLength(32)
  @IsString({})
  @IsAlphanumeric('en-US')
  @IsNotEmpty({ message: 'Username field is required' })
  username: string

  @MinLength(6)
  @MaxLength(64)
  @IsString({})
  @IsNotEmpty({ message: 'Password field is required' })
  password: string
}
