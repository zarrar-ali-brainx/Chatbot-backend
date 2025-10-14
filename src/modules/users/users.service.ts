import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<Partial<User>> {

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const {password, ...userWithoutPassword} = user;
    return userWithoutPassword;

  }

  /**
   * Update user profile
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);
    const {password, ...userWithoutPassword} = updatedUser;
    return userWithoutPassword;

  }

  /**
   * Delete user account
   */
  async remove(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id} });
    if(!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.remove(user);

    return { message: 'User account deleted successfully'};

  }

  /**
   * Get all users (admin only - optional)
   */
  async findAll(): Promise<Partial<User>[]> {
    const users = await this.userRepository.find();
    return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);

  }
}
