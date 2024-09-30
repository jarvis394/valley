import { Injectable } from '@nestjs/common'
import { ConfigService } from '../config/config.service'

@Injectable()
export class FilesService {
  constructor(private readonly configService: ConfigService) {}
}
