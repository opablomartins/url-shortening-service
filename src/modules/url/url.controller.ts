import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { UrlService } from './url.service';

@Controller('shorten')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  create(@Body() dto: CreateUrlDto) {
    return this.urlService.create(dto);
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.urlService.findByCode(code);
  }

  @Put(':code')
  update(@Param('code') code: string, @Body() dto: UpdateUrlDto) {
    return this.urlService.update(code, dto);
  }

  @Delete(':code')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('code') code: string) {
    return this.urlService.remove(code);
  }

  @Get(':code/stats')
  getStats(@Param('code') code: string) {
    return this.urlService.getStats(code);
  }
}
