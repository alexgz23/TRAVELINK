import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as TypesenseClient, SearchParams } from 'typesense';
import {
  createTypesenseClient,
  TypesenseCollections,
  ExperienceCollectionSchema,
  UserCollectionSchema,
  PostCollectionSchema,
  ReviewCollectionSchema,
} from '../config/typesense.config';
import {
  SearchExperiencesDto,
  SearchUsersDto,
  AutocompleteDto,
  SearchResponseDto,
  SearchSortBy,
} from './dto/search.dto';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private readonly client: TypesenseClient;

  constructor(private readonly configService: ConfigService) {
    this.client = createTypesenseClient(configService);
  }

  /**
   * Initialize collections on module start
   */
  async onModuleInit() {
    try {
      await this.initializeCollections();
      this.logger.log('Typesense collections initialized');
    } catch (error) {
      this.logger.error(
        `Failed to initialize Typesense: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Initialize/update all collections
   */
  private async initializeCollections(): Promise<void> {
    const schemas = [
      ExperienceCollectionSchema,
      UserCollectionSchema,
      PostCollectionSchema,
      ReviewCollectionSchema,
    ];

    for (const schema of schemas) {
      try {
        // Try to get existing collection
        await this.client.collections(schema.name).retrieve();
        this.logger.log(`Collection ${schema.name} already exists`);
      } catch (error) {
        if (error.httpStatus === 404) {
          // Collection doesn't exist, create it
          await this.client.collections().create(schema);
          this.logger.log(`Created collection: ${schema.name}`);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Search experiences
   */
  async searchExperiences(
    dto: SearchExperiencesDto,
  ): Promise<SearchResponseDto> {
    try {
      const filterBy: string[] = ['isActive:true'];

      // Add filters
      if (dto.category) {
        filterBy.push(`category:=${dto.category}`);
      }
      if (dto.city) {
        filterBy.push(`city:=${dto.city}`);
      }
      if (dto.country) {
        filterBy.push(`country:=${dto.country}`);
      }
      if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
        const min = dto.minPrice ?? 0;
        const max = dto.maxPrice ?? Number.MAX_SAFE_INTEGER;
        filterBy.push(`price:[${min}..${max}]`);
      }
      if (dto.minRating !== undefined) {
        filterBy.push(`rating:>=${dto.minRating}`);
      }
      if (dto.tags) {
        const tagsList = dto.tags.split(',').map((t) => t.trim());
        filterBy.push(`tags:=[${tagsList.join(',')}]`);
      }

      const searchParams: SearchParams = {
        q: dto.q,
        query_by: 'title,description,location,tags,providerName',
        filter_by: filterBy.join(' && '),
        sort_by: dto.sortBy || SearchSortBy.RELEVANCE,
        page: dto.page || 1,
        per_page: dto.limit || 20,
        facet_by: 'category,city,country,tags,rating',
        max_facet_values: 10,
      };

      const startTime = Date.now();
      const result = await this.client
        .collections(TypesenseCollections.EXPERIENCES)
        .documents()
        .search(searchParams);

      const searchTimeMs = Date.now() - startTime;

      return {
        total: result.found,
        page: result.page,
        limit: searchParams.per_page,
        totalPages: Math.ceil(result.found / searchParams.per_page),
        results: result.hits.map((hit) => hit.document),
        facets: this.formatFacets(result.facet_counts),
        searchTimeMs,
      };
    } catch (error) {
      this.logger.error(
        `Search experiences failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Search users
   */
  async searchUsers(dto: SearchUsersDto): Promise<SearchResponseDto> {
    try {
      const filterBy: string[] = ['isActive:true'];

      if (dto.role) {
        filterBy.push(`role:=${dto.role}`);
      }
      if (dto.isVerified !== undefined) {
        filterBy.push(`isVerified:${dto.isVerified}`);
      }

      const searchParams: SearchParams = {
        q: dto.q,
        query_by: 'firstName,lastName,username,bio',
        filter_by: filterBy.join(' && '),
        sort_by: 'followersCount:desc',
        page: dto.page || 1,
        per_page: dto.limit || 20,
        facet_by: 'role,level,isVerified',
        max_facet_values: 10,
      };

      const startTime = Date.now();
      const result = await this.client
        .collections(TypesenseCollections.USERS)
        .documents()
        .search(searchParams);

      const searchTimeMs = Date.now() - startTime;

      return {
        total: result.found,
        page: result.page,
        limit: searchParams.per_page,
        totalPages: Math.ceil(result.found / searchParams.per_page),
        results: result.hits.map((hit) => hit.document),
        facets: this.formatFacets(result.facet_counts),
        searchTimeMs,
      };
    } catch (error) {
      this.logger.error(`Search users failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Autocomplete for experiences
   */
  async autocompleteExperiences(
    dto: AutocompleteDto,
  ): Promise<{ suggestions: string[] }> {
    try {
      const result = await this.client
        .collections(TypesenseCollections.EXPERIENCES)
        .documents()
        .search({
          q: dto.q,
          query_by: 'title,location,city',
          filter_by: 'isActive:true',
          per_page: dto.limit || 5,
          prefix: true, // Enable prefix search for autocomplete
        });

      const suggestions = result.hits.map((hit: any) => ({
        title: hit.document.title,
        location: hit.document.location,
        id: hit.document.id,
      }));

      return { suggestions };
    } catch (error) {
      this.logger.error(
        `Autocomplete failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Index a single experience
   */
  async indexExperience(experience: any): Promise<void> {
    try {
      const document = {
        id: experience.id,
        title: experience.title,
        description: experience.description || '',
        category: experience.category,
        location: experience.location,
        city: experience.city || '',
        country: experience.country || '',
        price: parseFloat(experience.price) || 0,
        rating: parseFloat(experience.averageRating) || 0,
        reviewCount: experience.reviewCount || 0,
        duration: experience.duration || 0,
        maxGroupSize: experience.maxGroupSize || 0,
        providerId: experience.providerId,
        providerName: experience.provider?.firstName || '',
        tags: experience.tags || [],
        isActive: experience.isActive !== false,
        createdAt: Math.floor(new Date(experience.createdAt).getTime() / 1000),
      };

      await this.client
        .collections(TypesenseCollections.EXPERIENCES)
        .documents()
        .upsert(document);

      this.logger.log(`Indexed experience: ${experience.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to index experience ${experience.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Index a single user
   */
  async indexUser(user: any): Promise<void> {
    try {
      const document = {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || user.email.split('@')[0],
        bio: user.bio || '',
        location: user.location || '',
        role: user.role,
        level: user.level || 1,
        points: user.points || 0,
        followersCount: user.followersCount || 0,
        experiencesCount: user.experiencesCount || 0,
        isVerified: user.isVerified || false,
        isActive: user.isActive !== false,
        createdAt: Math.floor(new Date(user.createdAt).getTime() / 1000),
      };

      await this.client
        .collections(TypesenseCollections.USERS)
        .documents()
        .upsert(document);

      this.logger.log(`Indexed user: ${user.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to index user ${user.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Remove document from index
   */
  async removeFromIndex(
    collection: string,
    documentId: string,
  ): Promise<void> {
    try {
      await this.client
        .collections(collection)
        .documents(documentId)
        .delete();

      this.logger.log(`Removed ${documentId} from ${collection}`);
    } catch (error) {
      if (error.httpStatus === 404) {
        // Document doesn't exist, ignore
        return;
      }
      this.logger.error(
        `Failed to remove ${documentId} from index: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Bulk index experiences
   */
  async bulkIndexExperiences(experiences: any[]): Promise<void> {
    try {
      const documents = experiences.map((exp) => ({
        id: exp.id,
        title: exp.title,
        description: exp.description || '',
        category: exp.category,
        location: exp.location,
        city: exp.city || '',
        country: exp.country || '',
        price: parseFloat(exp.price) || 0,
        rating: parseFloat(exp.averageRating) || 0,
        reviewCount: exp.reviewCount || 0,
        duration: exp.duration || 0,
        maxGroupSize: exp.maxGroupSize || 0,
        providerId: exp.providerId,
        providerName: exp.provider?.firstName || '',
        tags: exp.tags || [],
        isActive: exp.isActive !== false,
        createdAt: Math.floor(new Date(exp.createdAt).getTime() / 1000),
      }));

      await this.client
        .collections(TypesenseCollections.EXPERIENCES)
        .documents()
        .import(documents, { action: 'upsert' });

      this.logger.log(`Bulk indexed ${experiences.length} experiences`);
    } catch (error) {
      this.logger.error(
        `Bulk index failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get popular searches (trending)
   */
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    // This would typically come from analytics
    // For now, return common searches
    return [
      'tour ciudad perdida',
      'parapente medellín',
      'city tour cartagena',
      'eje cafetero',
      'buceo san andrés',
      'trekking cocora',
      'tour nocturno bogotá',
      'avistamiento ballenas',
      'rafting río claro',
      'paracaidismo',
    ].slice(0, limit);
  }

  /**
   * Get search suggestions based on user history
   * TODO: Implement based on user search history
   */
  async getPersonalizedSuggestions(userId: string): Promise<string[]> {
    // Placeholder - would query user's search history
    return this.getPopularSearches(5);
  }

  /**
   * Format facets for response
   */
  private formatFacets(facetCounts?: any[]): Record<string, any> {
    if (!facetCounts) return {};

    const formatted: Record<string, any> = {};

    facetCounts.forEach((facet) => {
      formatted[facet.field_name] = facet.counts.map((count: any) => ({
        value: count.value,
        count: count.count,
      }));
    });

    return formatted;
  }

  /**
   * Health check for Typesense
   */
  async healthCheck(): Promise<{ status: string; version?: string }> {
    try {
      const health = await this.client.health.retrieve();
      return {
        status: health.ok ? 'healthy' : 'unhealthy',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
      };
    }
  }
}
