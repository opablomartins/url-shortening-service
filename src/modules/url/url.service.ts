import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { UrlResponseDto } from './dto/url-response.dto';
import { Url } from './entities/url.entity';
import { UrlRepository } from './url.repository';

const MAX_RETRIES = 3;
const SHORT_CODE_LENGTH = 6;

@Injectable()
export class UrlService {
  private readonly logger = new Logger(UrlService.name);

  constructor(private readonly urlRepository: UrlRepository) {}

  async create(dto: CreateUrlDto): Promise<UrlResponseDto> {
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
      const shortCode = nanoid(SHORT_CODE_LENGTH);
      const existing = await this.urlRepository.findByCode(shortCode);

      if (!existing) {
        this.logger.log(`Creating short URL for: ${dto.url}`);
        const created = await this.urlRepository.save({ url: dto.url, shortCode });
        return UrlResponseDto.fromEntity(created);
      }

      attempts++;
      this.logger.warn(`Short code collision detected (attempt ${attempts}): ${shortCode}`);
    }

    throw new ConflictException('Failed to generate a unique short code. Please try again.');
  }

  async findByCode(shortCode: string): Promise<UrlResponseDto> {
    const url = await this.urlRepository.findByCode(shortCode);

    if (!url) {
      throw new NotFoundException(`Short code "${shortCode}" not found`);
    }

    await this.urlRepository.incrementAccessCount(shortCode);
    this.logger.log(`Access registered for short code: ${shortCode}`);

    return UrlResponseDto.fromEntity(url);
  }

  async update(shortCode: string, dto: UpdateUrlDto): Promise<UrlResponseDto> {
    const existing = await this.urlRepository.findByCode(shortCode);

    if (!existing) {
      throw new NotFoundException(`Short code "${shortCode}" not found`);
    }

    const updated = await this.urlRepository.updateUrl(shortCode, dto.url);
    this.logger.log(`Updated short code: ${shortCode}`);

    return UrlResponseDto.fromEntity(updated!);
  }

  async remove(shortCode: string): Promise<void> {
    const deleted = await this.urlRepository.deleteByCode(shortCode);

    if (!deleted) {
      throw new NotFoundException(`Short code "${shortCode}" not found`);
    }

    this.logger.log(`Deleted short code: ${shortCode}`);
  }

  async getStats(shortCode: string): Promise<Url> {
    const url = await this.urlRepository.findByCode(shortCode);

    if (!url) {
      throw new NotFoundException(`Short code "${shortCode}" not found`);
    }

    return url;
  }
}
