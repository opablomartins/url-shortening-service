import { IsUrl } from 'class-validator';

export class UpdateUrlDto {
  @IsUrl({}, { message: 'originalUrl must be a valid URL' })
  originalUrl: string;
}
