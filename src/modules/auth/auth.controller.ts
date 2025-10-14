import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * POST /auth/register
   * 
   * TODO: Implement user registration logic
   * - Validate input data using RegisterDto
   * - Check if email already exists
   * - Hash password before storing
   * - Create user in database
   * - Return JWT token and user data
   */
  @Post('register')
  @Public() // This endpoint doesn't require authentication
  async register(@Body() registerDto: RegisterDto) {
    
    return this.authService.register(registerDto);
  }

  /**
   * Login user
   * POST /auth/login
   * 
   * TODO: Implement user login logic
   * - Validate credentials using LoginDto
   * - Verify email and password
   * - Generate JWT token
   * - Return token and user data
   */
  @Post('login')
  @Public() // This endpoint doesn't require authentication
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Get current user profile
   * GET /auth/profile
   * 
   * TODO: Implement profile retrieval
   * - Use JWT token to identify user
   * - Return user profile data
   * - Exclude sensitive information (password)
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard) // This endpoint requires authentication
  async getProfile(@Request() req) {
    return this.authService.findById(req.user.id);
  }

  /**
   * Logout user (optional - JWT is stateless)
   * POST /auth/logout
   * 
   * TODO: Implement logout logic if needed
   * - In JWT, logout is typically handled client-side
   * - You might want to maintain a blacklist of tokens
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }
}
