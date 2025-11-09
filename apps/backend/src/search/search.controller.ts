import {
  Controller,
  Get,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import {
  SearchExperiencesDto,
  SearchUsersDto,
  AutocompleteDto,
  SearchResponseDto,
} from './dto/search.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('experiences')
  @Public() // Allow public access
  @ApiOperation({
    summary: 'Search experiences with filters',
    description: 'Full-text search for experiences with advanced filtering',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results',
    type: SearchResponseDto,
  })
  async searchExperiences(
    @Query() dto: SearchExperiencesDto,
  ): Promise<SearchResponseDto> {
    return this.searchService.searchExperiences(dto);
  }

  @Get('users')
  @ApiOperation({
    summary: 'Search users',
    description: 'Search for users by name, username, or bio',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results',
    type: SearchResponseDto,
  })
  async searchUsers(@Query() dto: SearchUsersDto): Promise<SearchResponseDto> {
    return this.searchService.searchUsers(dto);
  }

  @Get('autocomplete')
  @Public()
  @ApiOperation({
    summary: 'Autocomplete suggestions for experiences',
    description: 'Get quick suggestions as the user types',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query',
    example: 'cart',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of suggestions',
    example: 5,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Autocomplete suggestions',
    schema: {
      type: 'object',
      properties: {
        suggestions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', example: 'City Tour Cartagena' },
              location: { type: 'string', example: 'Cartagena, Colombia' },
              id: { type: 'string', example: 'uuid' },
            },
          },
        },
      },
    },
  })
  async autocomplete(@Query() dto: AutocompleteDto) {
    return this.searchService.autocompleteExperiences(dto);
  }

  @Get('popular')
  @Public()
  @ApiOperation({
    summary: 'Get popular searches',
    description: 'Get trending search queries',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results',
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Popular searches',
    schema: {
      type: 'object',
      properties: {
        searches: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'tour ciudad perdida',
            'parapente medellín',
            'city tour cartagena',
          ],
        },
      },
    },
  })
  async getPopularSearches(@Query('limit') limit?: number) {
    const searches = await this.searchService.getPopularSearches(
      limit ? parseInt(limit.toString()) : 10,
    );
    return { searches };
  }

  @Get('suggestions')
  @ApiOperation({
    summary: 'Get personalized search suggestions',
    description: 'Get search suggestions based on user history',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Personalized suggestions',
    schema: {
      type: 'object',
      properties: {
        suggestions: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  async getPersonalizedSuggestions(@CurrentUser() user: any) {
    const suggestions = await this.searchService.getPersonalizedSuggestions(
      user.sub,
    );
    return { suggestions };
  }

  @Get('health')
  @Public()
  @ApiOperation({
    summary: 'Search service health check',
    description: 'Check if Typesense is healthy',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        version: { type: 'string', example: '0.25.2' },
      },
    },
  })
  async healthCheck() {
    return this.searchService.healthCheck();
  }
}
