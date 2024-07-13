import {
  Logger,
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common'
import { compare, hash } from 'bcryptjs'
import { Prisma, User } from '@prisma/client'
import { SerializedUser } from '@app/shared'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class UserService {
  private readonly logger = new Logger('UserSerivce')

  constructor(private prisma: PrismaService) {}

  serializeUser(user: User): SerializedUser {
    return {
      id: user.id,
      email: user.email,
    }
  }

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput
  ): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    })
  }

  async users(params: {
    skip?: number
    take?: number
    cursor?: Prisma.UserWhereUniqueInput
    where?: Prisma.UserWhereInput
    orderBy?: Prisma.UserOrderByWithRelationInput
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params
    return await this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    })
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({
      data,
    })
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput
    data: Prisma.UserUpdateInput
  }): Promise<User> {
    const { where, data } = params
    return await this.prisma.user.update({
      data,
      where,
    })
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return await this.prisma.user.delete({
      where,
    })
  }

  async login(email: string, password: string): Promise<User> {
    const user = await this.user({ email })

    if (!user) {
      throw new Error('User not found')
    }

    const passwordMatch = await compare(password, user.password)

    if (!passwordMatch) {
      throw new Error('Invalid credentials')
    }

    return user
  }

  async register(user: Omit<User, 'id' | 'refreshToken'>): Promise<User> {
    const { email, password } = user
    const existingUser = await this.user({ email })

    if (existingUser) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.FORBIDDEN
      )
    }

    const newUser = await this.createUser({
      email,
      password: await this.hash(password),
    })

    return newUser
  }

  async hash(text: string): Promise<string> {
    const hashedText = await hash(text, 12)
    return hashedText
  }

  async getSelf(userId: User['id']): Promise<SerializedUser> {
    const user = await this.user({ id: userId })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return this.serializeUser(user)
  }

  async getByEmail(email: User['email']): Promise<SerializedUser> {
    const user = await this.user({ email })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return this.serializeUser(user)
  }
}
