import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { ProjectsService } from 'src/projects/projects.service'
import { FoldersService } from 'src/folders/folders.service'

@Injectable()
export class GalleriesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly projectsService: ProjectsService,
    private readonly foldersService: FoldersService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getGallery(username: string, slug: string) {
    return { username, slug }
  }
}
