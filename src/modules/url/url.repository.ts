import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from './entities/url.entity';

@Injectable()
export class UrlRepository {
  constructor(
    @InjectRepository(Url)
    private readonly repo: Repository<Url>,
  ) {}

  async save(data: Partial<Url>): Promise<Url> {
    const url = this.repo.create(data);
    return this.repo.save(url);
  }

  async findByCode(shortCode: string): Promise<Url | null> {
    return this.repo.findOne({ where: { shortCode } });
  }

  async incrementAccessCount(shortCode: string): Promise<void> {
    await this.repo.increment({ shortCode }, 'accessCount', 1);
  }

  async updateOriginalUrl(shortCode: string, originalUrl: string): Promise<Url | null> {
    await this.repo.update({ shortCode }, { originalUrl });
    return this.findByCode(shortCode);
  }

  async deleteByCode(shortCode: string): Promise<boolean> {
    const result = await this.repo.delete({ shortCode });
    return (result.affected ?? 0) > 0;
  }
}
