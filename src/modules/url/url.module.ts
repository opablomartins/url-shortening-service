import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { RedirectController } from './redirect.controller';
import { UrlController } from './url.controller';
import { UrlRepository } from './url.repository';
import { UrlService } from './url.service';

@Module({
  imports: [TypeOrmModule.forFeature([Url])],
  controllers: [UrlController, RedirectController],
  providers: [UrlService, UrlRepository],
})
export class UrlModule {}
