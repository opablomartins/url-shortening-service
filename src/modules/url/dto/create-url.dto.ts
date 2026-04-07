import { IsUrl } from 'class-validator';

export class CreateUrlDto {
  @IsUrl({}, { message: 'originalUrl must be a valid URL' })
  originalUrl: string;
}
