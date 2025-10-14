import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  /**
   * User's email address
   * Must be a valid email format
   */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  /**
   * User's password
   * Required for authentication
   */
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
