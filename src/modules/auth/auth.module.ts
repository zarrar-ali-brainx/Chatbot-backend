import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from '../../modules/auth/auth.service';
import { User } from '../../entities/user.entity';
import { JwtStrategy } from '../../modules/auth/strategies/jwt.strategy';
import { LocalStrategy } from '../../modules/auth/strategies/local.strategy';

@Module({
  imports: [
    // Import TypeORM for User entity
    TypeOrmModule.forFeature([User]),
    
    // Import Passport for authentication strategies
    PassportModule,
    
    // Configure JWT module with secret and expiration
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('app.jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('app.jwt.expiresIn'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
  ],
  exports: [AuthService], // Export AuthService for use in other modules
})
export class AuthModule {}
