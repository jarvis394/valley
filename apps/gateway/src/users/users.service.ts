import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma, User } from '@prisma/client'
import { SerializedUser } from '@valley/shared'
import { compare, hash } from 'bcryptjs'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  serializeUser(user: User): SerializedUser {
    return {
      id: user.id,
      username: user.username,
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

  async login(username: string, password: string): Promise<User> {
    const user = await this.user({ username })

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
    const { username, password } = user
    const existingUser = await this.user({ username })

    if (existingUser) {
      throw new HttpException(
        'User with this username already exists',
        HttpStatus.FORBIDDEN
      )
    }

    const newUser = await this.createUser({
      username,
      password: await this.hash(password),
      projects: {},
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
}
