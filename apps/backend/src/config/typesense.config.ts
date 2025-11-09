import { ConfigService } from '@nestjs/config';
import { Client as TypesenseClient } from 'typesense';

/**
 * Typesense Client Factory
 */
export const createTypesenseClient = (
  configService: ConfigService,
): TypesenseClient => {
  const host = configService.get<string>('TYPESENSE_HOST', 'localhost');
  const port = configService.get<number>('TYPESENSE_PORT', 8108);
  const protocol = configService.get<string>('TYPESENSE_PROTOCOL', 'http');
  const apiKey = configService.get<string>('TYPESENSE_API_KEY');

  if (!apiKey) {
    throw new Error('TYPESENSE_API_KEY is not configured');
  }

  return new TypesenseClient({
    nodes: [
      {
        host,
        port,
        protocol,
      },
    ],
    apiKey,
    connectionTimeoutSeconds: 5,
    numRetries: 3,
    retryIntervalSeconds: 1,
  });
};

/**
 * Collection schemas for Typesense
 */
export const TypesenseCollections = {
  EXPERIENCES: 'experiences',
  USERS: 'users',
  POSTS: 'posts',
  REVIEWS: 'reviews',
} as const;

/**
 * Experience collection schema
 */
export const ExperienceCollectionSchema = {
  name: TypesenseCollections.EXPERIENCES,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'description', type: 'string' },
    { name: 'category', type: 'string', facet: true },
    { name: 'location', type: 'string', facet: true },
    { name: 'city', type: 'string', facet: true },
    { name: 'country', type: 'string', facet: true },
    { name: 'price', type: 'float', facet: true },
    { name: 'rating', type: 'float', facet: true },
    { name: 'reviewCount', type: 'int32' },
    { name: 'duration', type: 'int32' },
    { name: 'maxGroupSize', type: 'int32' },
    { name: 'providerId', type: 'string' },
    { name: 'providerName', type: 'string' },
    { name: 'tags', type: 'string[]', facet: true },
    { name: 'isActive', type: 'bool', facet: true },
    { name: 'createdAt', type: 'int64' }, // Unix timestamp
  ],
  default_sorting_field: 'rating',
};

/**
 * User collection schema
 */
export const UserCollectionSchema = {
  name: TypesenseCollections.USERS,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'firstName', type: 'string' },
    { name: 'lastName', type: 'string' },
    { name: 'username', type: 'string' },
    { name: 'bio', type: 'string', optional: true },
    { name: 'location', type: 'string', optional: true },
    { name: 'role', type: 'string', facet: true },
    { name: 'level', type: 'int32', facet: true },
    { name: 'points', type: 'int32' },
    { name: 'followersCount', type: 'int32' },
    { name: 'experiencesCount', type: 'int32' },
    { name: 'isVerified', type: 'bool', facet: true },
    { name: 'isActive', type: 'bool', facet: true },
    { name: 'createdAt', type: 'int64' },
  ],
  default_sorting_field: 'followersCount',
};

/**
 * Post collection schema
 */
export const PostCollectionSchema = {
  name: TypesenseCollections.POSTS,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'content', type: 'string' },
    { name: 'userId', type: 'string' },
    { name: 'userName', type: 'string' },
    { name: 'likesCount', type: 'int32' },
    { name: 'commentsCount', type: 'int32' },
    { name: 'tags', type: 'string[]', facet: true, optional: true },
    { name: 'location', type: 'string', facet: true, optional: true },
    { name: 'isPublic', type: 'bool', facet: true },
    { name: 'createdAt', type: 'int64' },
  ],
  default_sorting_field: 'createdAt',
};

/**
 * Review collection schema
 */
export const ReviewCollectionSchema = {
  name: TypesenseCollections.REVIEWS,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'content', type: 'string' },
    { name: 'rating', type: 'float', facet: true },
    { name: 'experienceId', type: 'string' },
    { name: 'experienceTitle', type: 'string' },
    { name: 'userId', type: 'string' },
    { name: 'userName', type: 'string' },
    { name: 'isVerified', type: 'bool', facet: true },
    { name: 'helpfulCount', type: 'int32' },
    { name: 'createdAt', type: 'int64' },
  ],
  default_sorting_field: 'createdAt',
};
