import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class UpdateUrlDto {
  @ApiProperty({
    description: 'The new original URL to replace the current one',
    example: 'https://www.example.com/updated/path',
  })
  @IsUrl({}, { message: 'url must be a valid URL' })
  url: string;
}
