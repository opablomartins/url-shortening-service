import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { UrlService } from './url.service';

@ApiTags('Redirect')
@Controller()
export class RedirectController {
  constructor(private readonly urlService: UrlService) {}

  @Get(':code')
  @ApiOperation({
    summary: 'Redirect to original URL',
    description:
      'Resolves the short code, increments the access counter, and redirects the client to the original URL with HTTP 301.',
  })
  @ApiParam({ name: 'code', example: 'xK9mNp', description: 'Short code' })
  @ApiResponse({ status: 302, description: 'Redirect to the original URL' })
  @ApiResponse({ status: 404, description: 'Short code not found' })
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const url = await this.urlService.findByCode(code);
    return res.redirect(302, url.url);
  }
}
