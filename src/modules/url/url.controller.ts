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
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { UrlResponseDto } from './dto/url-response.dto';
import { Url } from './entities/url.entity';
import { UrlService } from './url.service';

@ApiTags('URL Shortener')
@Controller('shorten')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  @ApiOperation({ summary: 'Create a shortened URL' })
  @ApiCreatedResponse({ description: 'URL successfully shortened', type: UrlResponseDto })
  @ApiConflictResponse({ description: 'Failed to generate a unique short code' })
  create(@Body() dto: CreateUrlDto) {
    return this.urlService.create(dto);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Retrieve the original URL and increment access count' })
  @ApiOkResponse({ description: 'URL found', type: UrlResponseDto })
  @ApiNotFoundResponse({ description: 'Short code not found' })
  findOne(@Param('code') code: string) {
    return this.urlService.findByCode(code);
  }

  @Put(':code')
  @ApiOperation({ summary: 'Update the original URL of a short code' })
  @ApiOkResponse({ description: 'URL successfully updated', type: UrlResponseDto })
  @ApiNotFoundResponse({ description: 'Short code not found' })
  update(@Param('code') code: string, @Body() dto: UpdateUrlDto) {
    return this.urlService.update(code, dto);
  }

  @Delete(':code')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a shortened URL' })
  @ApiNoContentResponse({ description: 'URL successfully deleted' })
  @ApiNotFoundResponse({ description: 'Short code not found' })
  remove(@Param('code') code: string) {
    return this.urlService.remove(code);
  }

  @Get(':code/stats')
  @ApiOperation({ summary: 'Get access statistics for a short code' })
  @ApiOkResponse({ description: 'Access statistics', type: Url })
  @ApiNotFoundResponse({ description: 'Short code not found' })
  getStats(@Param('code') code: string) {
    return this.urlService.getStats(code);
  }
}
