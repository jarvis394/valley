import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, Tag, User } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  async tag(
    tagWhereUniqueInput: Prisma.TagWhereUniqueInput
  ): Promise<Tag | null> {
    return await this.prisma.tag.findUnique({
      where: tagWhereUniqueInput,
    })
  }

  async tags(params: {
    skip?: number
    take?: number
    cursor?: Prisma.TagWhereUniqueInput
    where?: Prisma.TagWhereInput
    orderBy?: Prisma.TagOrderByWithRelationInput
  }): Promise<Tag[]> {
    const { skip, take, cursor, where, orderBy } = params
    return await this.prisma.tag.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    })
  }

  async createTag(
    userId: User['id'],
    data: Prisma.TagCreateInput
  ): Promise<Tag> {
    return await this.prisma.tag.create({
      data: {
        ...data,
        User: {
          connect: {
            id: userId,
          },
        },
      },
    })
  }

  async updateTag(params: {
    where: Prisma.TagWhereUniqueInput
    data: Prisma.TagUpdateInput
  }): Promise<Tag> {
    const { where, data } = params
    try {
      return await this.prisma.tag.update({
        data,
        where,
      })
    } catch (e) {
      throw new NotFoundException('Tag not found')
    }
  }

  async deleteTag(where: Prisma.TagWhereUniqueInput): Promise<Tag> {
    return await this.prisma.tag.delete({
      where,
    })
  }
}
