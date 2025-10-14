import { Controller, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard) // All user endpoints require authentication
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user profile
   * GET /users/profile
   */
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.id;
    return this.usersService.findById(userId);

  }

  /**
   * Update current user profile
   * PUT /users/profile
   */
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.id;
    return this.usersService.update(userId, updateUserDto);

  }

  /**
   * Delete current user account
   * DELETE /users/profile
   */
  @Delete('profile')
  async deleteProfile(@Request() req) {
    const userId = req.user.id;
    return this.usersService.remove(userId);

  }

  /**
   * Get user by ID (admin only - optional)
   * GET /users/:id
   */
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const userId = parseInt(id);
    return this.usersService.findById(userId);

  }
}
