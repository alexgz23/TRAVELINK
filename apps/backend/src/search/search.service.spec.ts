import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SearchService } from './search.service';
import { TypesenseCollections } from '../config/typesense.config';
import { SearchExperiencesDto, SearchUsersDto, AutocompleteDto, SearchSortBy } from './dto/search.dto';
import { createMockConfigService, createMockTypesenseClient } from '../test-utils/mocks';

// Mock the Typesense client factory
jest.mock('../config/typesense.config', () => ({
  createTypesenseClient: jest.fn(),
  TypesenseCollections: {
    EXPERIENCES: 'experiences',
    USERS: 'users',
    POSTS: 'posts',
    REVIEWS: 'reviews',
  },
  ExperienceCollectionSchema: { name: 'experiences', fields: [] },
  UserCollectionSchema: { name: 'users', fields: [] },
  PostCollectionSchema: { name: 'posts', fields: [] },
  ReviewCollectionSchema: { name: 'reviews', fields: [] },
}));

describe('SearchService', () => {
  let service: SearchService;
  let configService: jest.Mocked<ConfigService>;
  let mockTypesenseClient: any;

  const mockSearchResults = {
    found: 15,
    page: 1,
    hits: [
      {
        document: {
          id: 'exp-1',
          title: 'Tour Ciudad Perdida',
          description: 'Amazing trek',
          category: 'adventure',
          location: 'Santa Marta',
          price: 850000,
          rating: 4.8,
        },
      },
      {
        document: {
          id: 'exp-2',
          title: 'City Tour Cartagena',
          description: 'Historic tour',
          category: 'culture',
          location: 'Cartagena',
          price: 120000,
          rating: 4.5,
        },
      },
    ],
    facet_counts: [
      {
        field_name: 'category',
        counts: [
          { value: 'adventure', count: 8 },
          { value: 'culture', count: 7 },
        ],
      },
    ],
  };

  beforeEach(async () => {
    mockTypesenseClient = createMockTypesenseClient();
    
    const { createTypesenseClient } = require('../config/typesense.config');
    createTypesenseClient.mockReturnValue(mockTypesenseClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: ConfigService,
          useValue: createMockConfigService({
            TYPESENSE_HOST: 'localhost',
            TYPESENSE_PORT: 8108,
            TYPESENSE_PROTOCOL: 'http',
            TYPESENSE_API_KEY: 'test-api-key',
          }),
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchExperiences', () => {
    it('should search experiences with basic query', async () => {
      // Arrange
      const searchDto: SearchExperiencesDto = {
        q: 'ciudad perdida',
        page: 1,
        limit: 20,
      };

      mockTypesenseClient
        .collections()
        .documents()
        .search.mockResolvedValue(mockSearchResults);

      // Act
      const result = await service.searchExperiences(searchDto);

      // Assert
      expect(mockTypesenseClient.collections).toHaveBeenCalledWith(TypesenseCollections.EXPERIENCES);
      expect(result.total).toBe(15);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].title).toBe('Tour Ciudad Perdida');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.searchTimeMs).toBeDefined();
    });

    it('should apply category filter', async () => {
      // Arrange
      const searchDto: SearchExperiencesDto = {
        q: 'tour',
        category: 'adventure',
        page: 1,
        limit: 20,
      };

      mockTypesenseClient
        .collections()
        .documents()
        .search.mockResolvedValue(mockSearchResults);

      // Act
      await service.searchExperiences(searchDto);

      // Assert
      const searchParams = mockTypesenseClient.collections().documents().search.mock.calls[0][0];
      expect(searchParams.filter_by).toContain('category:=adventure');
    });

    it('should apply price range filter', async () => {
      // Arrange
      const searchDto: SearchExperiencesDto = {
        q: 'tour',
        minPrice: 50000,
        maxPrice: 500000,
        page: 1,
        limit: 20,
      };

      mockTypesenseClient
        .collections()
        .documents()
        .search.mockResolvedValue(mockSearchResults);

      // Act
      await service.searchExperiences(searchDto);

      // Assert
      const searchParams = mockTypesenseClient.collections().documents().search.mock.calls[0][0];
      expect(searchParams.filter_by).toContain('price:[50000..500000]');
    });

    it('should apply minimum rating filter', async () => {
      // Arrange
      const searchDto: SearchExperiencesDto = {
        q: 'tour',
        minRating: 4.0,
        page: 1,
        limit: 20,
      };

      mockTypesenseClient
        .collections()
        .documents()
        .search.mockResolvedValue(mockSearchResults);

      // Act
      await service.searchExperiences(searchDto);

      // Assert
      const searchParams = mockTypesenseClient.collections().documents().search.mock.calls[0][0];
      expect(searchParams.filter_by).toContain('rating:>=4');
    });

    it('should apply tags filter', async () => {
      // Arrange
      const searchDto: SearchExperiencesDto = {
        q: 'tour',
        tags: 'naturaleza,aventura',
        page: 1,
        limit: 20,
      };

      mockTypesenseClient
        .collections()
        .documents()
        .search.mockResolvedValue(mockSearchResults);

      // Act
      await service.searchExperiences(searchDto);

      // Assert
      const searchParams = mockTypesenseClient.collections().documents().search.mock.calls[0][0];
      expect(searchParams.filter_by).toContain('tags:=[naturaleza,aventura]');
    });

    it('should apply custom sorting', async () => {
      // Arrange
      const searchDto: SearchExperiencesDto = {
        q: 'tour',
        sortBy: SearchSortBy.PRICE_ASC,
        page: 1,
        limit: 20,
      };

      mockTypesenseClient
        .collections()
        .documents()
        .search.mockResolvedValue(mockSearchResults);

      // Act
      await service.searchExperiences(searchDto);

      // Assert
      const searchParams = mockTypesenseClient.collections().documents().search.mock.calls[0][0];
      expect(searchParams.sort_by).toBe(SearchSortBy.PRICE_ASC);
    });

    it('should return formatted facets', async () => {
      // Arrange
      const searchDto: SearchExperiencesDto = {
        q: 'tour',
        page: 1,
        limit: 20,
      };

      mockTypesenseClient
        .collections()
        .documents()
        .search.mockResolvedValue(mockSearchResults);

      // Act
      const result = await service.searchExperiences(searchDto);

      // Assert
      expect(result.facets).toBeDefined();
      expect(result.facets?.category).toEqual([
        { value: 'adventure', count: 8 },
        { value: 'culture', count: 7 },
      ]);
    });

    it('should calculate total pages correctly', async () => {
      // Arrange
      const searchDto: SearchExperiencesDto = {
        q: 'tour',
        page: 1,
        limit: 10,
      };

      const resultsWithTotal = { ...mockSearchResults, found: 25 };
      mockTypesenseClient
        .collections()
        .documents()
        .search.mockResolvedValue(resultsWithTotal);

      // Act
      const result = await service.searchExperiences(searchDto);

      // Assert
      expect(result.totalPages).toBe(3); // Math.ceil(25 / 10)
    });

    it('should handle search errors gracefully', async () => {
      // Arrange
      const searchDto: SearchExperiencesDto = {
        q: 'tour',
        page: 1,
        limit: 20,
      };

      mockTypesenseClient
        .collections()
        .documents()
        .search.mockRejectedValue(new Error('Typesense connection failed'));

      // Act & Assert
      await expect(service.searchExperiences(searchDto)).rejects.toThrow('Typesense connection failed');
    });
  });

  describe('searchUsers', () => {
    const mockUserResults = {
      found: 5,
      page: 1,
      hits: [
        {
          document: {
            id: 'user-1',
            firstName: 'Juan',
            lastName: 'Pérez',
            username: 'juanperez',
            role: 'GUIDE',
            isVerified: true,
          },
        },
      ],
      facet_counts: [],
    };

    it('should search users by query', async () => {
      // Arrange
      const searchDto: SearchUsersDto = {
        q: 'juan',
        page: 1,
        limit: 20,
      };

      mockTypesenseClient
        .collections()
        .documents()
        .search.mockResolvedValue(mockUserResults);

      // Act
      const result = await service.searchUsers(searchDto);

      // Assert
      expect(mockTypesenseClient.collections).toHaveBeenCalledWith(TypesenseCollections.USERS);
      expect(result.total).toBe(5);
      expect(result.results[0].username).toBe('juanperez');
    });

    it('should filter by role', async () => {
      // Arrange
      const searchDto: SearchUsersDto = {
        q: 'juan',
        role: 'GUIDE',
        page: 1,
        limit: 20,
      };

      mockTypesenseClient
        .collections()
        .documents()
        .search.mockResolvedValue(mockUserResults);

      // Act
      await service.searchUsers(searchDto);

      // Assert
      const searchParams = mockTypesenseClient.collections().documents().search.mock.calls[0][0];
      expect(searchParams.filter_by).toContain('role:=GUIDE');
    });

    it('should filter by verified status', async () => {
      // Arrange
      const searchDto: SearchUsersDto = {
        q: 'juan',
        isVerified: true,
        page: 1,
        limit: 20,
      };

      mockTypesenseClient
        .collections()
        .documents()
        .search.mockResolvedValue(mockUserResults);

      // Act
      await service.searchUsers(searchDto);

      // Assert
      const searchParams = mockTypesenseClient.collections().documents().search.mock.calls[0][0];
      expect(searchParams.filter_by).toContain('isVerified:true');
    });
  });

  describe('autocompleteExperiences', () => {
    const mockAutocompleteResults = {
      found: 3,
      hits: [
        { document: { id: '1', title: 'Cartagena City Tour', location: 'Cartagena' } },
        { document: { id: '2', title: 'Cartagena Night Tour', location: 'Cartagena' } },
        { document: { id: '3', title: 'Cartagena Beach', location: 'Cartagena' } },
      ],
    };

    it('should return autocomplete suggestions', async () => {
      // Arrange
      const autocompleteDto: AutocompleteDto = {
        q: 'cart',
        limit: 5,
      };

      mockTypesenseClient
        .collections()
        .documents()
        .search.mockResolvedValue(mockAutocompleteResults);

      // Act
      const result = await service.autocompleteExperiences(autocompleteDto);

      // Assert
      expect(result.suggestions).toHaveLength(3);
      expect((result.suggestions[0] as any).title).toBe('Cartagena City Tour');
      expect((result.suggestions[0] as any).location).toBe('Cartagena');
      const searchParams = mockTypesenseClient.collections().documents().search.mock.calls[0][0];
      expect(searchParams.prefix).toBe(true);
    });

    it('should limit suggestions', async () => {
      // Arrange
      const autocompleteDto: AutocompleteDto = {
        q: 'cart',
        limit: 2,
      };

      mockTypesenseClient
        .collections()
        .documents()
        .search.mockResolvedValue(mockAutocompleteResults);

      // Act
      await service.autocompleteExperiences(autocompleteDto);

      // Assert
      const searchParams = mockTypesenseClient.collections().documents().search.mock.calls[0][0];
      expect(searchParams.per_page).toBe(2);
    });
  });

  describe('indexExperience', () => {
    it('should index experience document', async () => {
      // Arrange
      const experience = {
        id: 'exp-1',
        title: 'Test Experience',
        description: 'Test description',
        category: 'adventure',
        location: 'Test Location',
        price: 100000,
        averageRating: 4.5,
        createdAt: new Date(),
        isActive: true,
        providerId: 'provider-1',
        provider: { firstName: 'John' },
      };

      mockTypesenseClient.collections().documents().upsert.mockResolvedValue({});

      // Act
      await service.indexExperience(experience);

      // Assert
      expect(mockTypesenseClient.collections).toHaveBeenCalledWith(TypesenseCollections.EXPERIENCES);
      expect(mockTypesenseClient.collections().documents().upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: experience.id,
          title: experience.title,
          category: experience.category,
          price: experience.price,
          rating: experience.averageRating,
        }),
      );
    });

    it('should convert createdAt to Unix timestamp', async () => {
      // Arrange
      const experience = {
        id: 'exp-1',
        title: 'Test',
        createdAt: new Date('2024-01-15T10:30:00Z'),
        isActive: true,
        price: 100000,
      };

      mockTypesenseClient.collections().documents().upsert.mockResolvedValue({});

      // Act
      await service.indexExperience(experience);

      // Assert
      const call = mockTypesenseClient.collections().documents().upsert.mock.calls[0][0];
      expect(call.createdAt).toBe(Math.floor(new Date('2024-01-15T10:30:00Z').getTime() / 1000));
    });
  });

  describe('bulkIndexExperiences', () => {
    it('should bulk index multiple experiences', async () => {
      // Arrange
      const experiences = [
        { id: '1', title: 'Exp 1', createdAt: new Date(), isActive: true, price: 100000 },
        { id: '2', title: 'Exp 2', createdAt: new Date(), isActive: true, price: 200000 },
        { id: '3', title: 'Exp 3', createdAt: new Date(), isActive: true, price: 300000 },
      ];

      mockTypesenseClient.collections().documents().import.mockResolvedValue({});

      // Act
      await service.bulkIndexExperiences(experiences);

      // Assert
      expect(mockTypesenseClient.collections().documents().import).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: '1', title: 'Exp 1' }),
          expect.objectContaining({ id: '2', title: 'Exp 2' }),
          expect.objectContaining({ id: '3', title: 'Exp 3' }),
        ]),
        { action: 'upsert' },
      );
    });
  });

  describe('removeFromIndex', () => {
    it('should remove document from index', async () => {
      // Arrange
      mockTypesenseClient.collections().documents().delete.mockResolvedValue({});

      // Act
      await service.removeFromIndex(TypesenseCollections.EXPERIENCES, 'exp-123');

      // Assert
      expect(mockTypesenseClient.collections).toHaveBeenCalledWith(TypesenseCollections.EXPERIENCES);
      expect(mockTypesenseClient.collections().documents).toHaveBeenCalledWith('exp-123');
      expect(mockTypesenseClient.collections().documents().delete).toHaveBeenCalled();
    });

    it('should handle 404 errors gracefully', async () => {
      // Arrange
      const error = new Error('Not found');
      (error as any).httpStatus = 404;
      mockTypesenseClient.collections().documents().delete.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.removeFromIndex(TypesenseCollections.EXPERIENCES, 'exp-123'),
      ).resolves.not.toThrow();
    });
  });

  describe('getPopularSearches', () => {
    it('should return popular searches', async () => {
      // Act
      const result = await service.getPopularSearches(5);

      // Assert
      expect(result).toHaveLength(5);
      expect(result).toContain('tour ciudad perdida');
    });

    it('should limit results', async () => {
      // Act
      const result = await service.getPopularSearches(3);

      // Assert
      expect(result).toHaveLength(3);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      // Arrange
      mockTypesenseClient.health.retrieve.mockResolvedValue({ ok: true });

      // Act
      const result = await service.healthCheck();

      // Assert
      expect(result.status).toBe('healthy');
    });

    it('should return unhealthy on error', async () => {
      // Arrange
      mockTypesenseClient.health.retrieve.mockRejectedValue(new Error('Connection failed'));

      // Act
      const result = await service.healthCheck();

      // Assert
      expect(result.status).toBe('unhealthy');
    });
  });
});
