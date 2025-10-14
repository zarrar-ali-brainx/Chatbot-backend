import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  /**
   * User's full name
   * Optional field for updating
   */
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name?: string;

  /**
   * User's email address
   * Optional field for updating
   * Must be a valid email format if provided
   */
  @IsOptional()
  @IsString({ message: 'Email must be a string' })
  email?: string;

  // Note: Password updates should be handled separately with current password verification
  // This DTO is for general profile updates only
}
