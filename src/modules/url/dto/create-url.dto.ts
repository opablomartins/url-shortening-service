import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class CreateUrlDto {
  @ApiProperty({
    description: 'The original URL to be shortened',
    example: 'https://www.example.com/some/very/long/path',
  })
  @IsUrl({}, { message: 'url must be a valid URL' })
  url: string;
}
