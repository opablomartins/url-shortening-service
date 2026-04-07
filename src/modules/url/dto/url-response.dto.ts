import { ApiProperty } from '@nestjs/swagger';
import { Url } from '../entities/url.entity';

export class UrlResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'https://www.example.com/some/very/long/path' })
  url: string;

  @ApiProperty({ example: 'xK9mNp' })
  shortCode: string;

  @ApiProperty({ example: '2026-04-07T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-04-07T13:00:00.000Z' })
  updatedAt: Date;

  static fromEntity(entity: Url): UrlResponseDto {
    return {
      id: entity.id,
      url: entity.url,
      shortCode: entity.shortCode,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
