import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User, UserRole, AuthProvider } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userModel.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.userModel.create({
      ...registerDto,
      role: UserRole.USER,
      authProvider: AuthProvider.EMAIL,
    });

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({
      where: { email, authProvider: AuthProvider.EMAIL },
    });

    if (user && (await user.validatePassword(password))) {
      return user;
    }
    return null;
  }

  async validateGoogleUser(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
    googleId: string;
  }): Promise<User> {
    let user = await this.userModel.findOne({
      where: { email: googleUser.email },
    });

    if (user) {
      if (user.authProvider === AuthProvider.EMAIL) {
        user.authProvider = AuthProvider.GOOGLE;
        user.googleId = googleUser.googleId;
        await user.save();
      }
      return user;
    }

    user = await this.userModel.create({
      ...googleUser,
      role: UserRole.USER,
      authProvider: AuthProvider.GOOGLE,
    });

    return user;
  }

  async googleLogin(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}