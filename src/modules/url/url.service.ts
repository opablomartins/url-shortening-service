import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { Url } from './entities/url.entity';
import { UrlRepository } from './url.repository';

const MAX_RETRIES = 3;
const SHORT_CODE_LENGTH = 6;

@Injectable()
export class UrlService {
  private readonly logger = new Logger(UrlService.name);

  constructor(private readonly urlRepository: UrlRepository) {}

  async create(dto: CreateUrlDto): Promise<Url> {
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
      const shortCode = nanoid(SHORT_CODE_LENGTH);
      const existing = await this.urlRepository.findByCode(shortCode);

      if (!existing) {
        this.logger.log(`Creating short URL for: ${dto.originalUrl}`);
        return this.urlRepository.save({ originalUrl: dto.originalUrl, shortCode });
      }

      attempts++;
      this.logger.warn(`Short code collision detected (attempt ${attempts}): ${shortCode}`);
    }

    throw new ConflictException('Failed to generate a unique short code. Please try again.');
  }

  async findByCode(shortCode: string): Promise<Url> {
    const url = await this.urlRepository.findByCode(shortCode);

    if (!url) {
      throw new NotFoundException(`Short code "${shortCode}" not found`);
    }

    await this.urlRepository.incrementAccessCount(shortCode);
    this.logger.log(`Access registered for short code: ${shortCode}`);

    return { ...url, accessCount: url.accessCount + 1 };
  }

  async update(shortCode: string, dto: UpdateUrlDto): Promise<Url> {
    const existing = await this.urlRepository.findByCode(shortCode);

    if (!existing) {
      throw new NotFoundException(`Short code "${shortCode}" not found`);
    }

    const updated = await this.urlRepository.updateOriginalUrl(shortCode, dto.originalUrl);
    this.logger.log(`Updated short code: ${shortCode}`);

    return updated!;
  }

  async remove(shortCode: string): Promise<void> {
    const deleted = await this.urlRepository.deleteByCode(shortCode);

    if (!deleted) {
      throw new NotFoundException(`Short code "${shortCode}" not found`);
    }

    this.logger.log(`Deleted short code: ${shortCode}`);
  }

  async getStats(shortCode: string): Promise<{ accessCount: number }> {
    const url = await this.urlRepository.findByCode(shortCode);

    if (!url) {
      throw new NotFoundException(`Short code "${shortCode}" not found`);
    }

    return { accessCount: url.accessCount };
  }
}
