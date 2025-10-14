import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { User } from '../../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../common/interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<{ access_token: string; user: Partial<User> }> {
    
    const existingUser = await this.userRepository.findOne({where: {email: registerDto.email}})
    if (existingUser) {
      throw new ConflictException('User with this email already exist');
    }
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);
    
    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
    })
    
    const savedUser = await this.userRepository.save(user);

    const payload: JwtPayload = { sub: savedUser.id, email: savedUser.email};
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
      }
    }
  }

  /**
   * Validate user credentials and login
   */
  async login(loginDto: LoginDto): Promise<{ access_token: string; user: Partial<User> }> {
    
    const user = await this.userRepository.findOne({ where: { email: loginDto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email}
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }

  }

  /**
   * Validate user for JWT strategy
   */
  async validateUser(payload: JwtPayload): Promise<User | null> {
  
    const user = await this.userRepository.findOne({ where: { id: payload.sub}})
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;

  }

  /**
   * Validate user for local strategy (email/password)
   */
  async validateUserByCredentials(email: string, password: string): Promise<User | null> {
    
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return null;
    }

    return user;

  }

  async findById(id: number): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async logout(userId: number): Promise<{ message: string }> {
    return { message: 'Logged out successfully' };
  }
}
