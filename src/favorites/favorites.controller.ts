import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findMyFavorites(@Req() req) {
    return this.favoritesService.findMyFavorites(req.user.id);
  }

  @Post(':productId')
  addToFavorites(
    @Req() req,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.favoritesService.addToFavorites(req.user.id, productId);
  }

  @Delete(':productId')
  removeFromFavorites(
    @Req() req,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.favoritesService.removeFromFavorites(req.user.id, productId);
  }
}