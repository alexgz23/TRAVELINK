import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

/**
 * Mock TypeORM Repository
 */
export const createMockRepository = <T = any>(): Partial<Repository<T>> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
  })),
});

/**
 * Get repository token for testing
 */
export const getMockRepositoryToken = (entity: any) => getRepositoryToken(entity);

/**
 * Mock ConfigService
 */
export const createMockConfigService = (config: Record<string, any> = {}) => ({
  get: jest.fn((key: string, defaultValue?: any) => {
    return config[key] ?? defaultValue;
  }),
  getOrThrow: jest.fn((key: string) => {
    if (!(key in config)) {
      throw new Error(`Configuration key ${key} does not exist`);
    }
    return config[key];
  }),
});

/**
 * Mock JwtService
 */
export const createMockJwtService = () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(() => ({ sub: 'user-id', email: 'test@example.com' })),
  decode: jest.fn(),
});

/**
 * Mock CacheService
 */
export const createMockCacheService = () => {
  const cache = new Map();
  return {
    get: jest.fn((key: string) => cache.get(key)),
    set: jest.fn((key: string, value: any, ttl?: number) => {
      cache.set(key, value);
      return Promise.resolve();
    }),
    del: jest.fn((key: string) => {
      cache.delete(key);
      return Promise.resolve();
    }),
    reset: jest.fn(() => {
      cache.clear();
      return Promise.resolve();
    }),
  };
};

/**
 * Mock Queue
 */
export const createMockQueue = () => ({
  add: jest.fn(),
  process: jest.fn(),
  on: jest.fn(),
  getJob: jest.fn(),
  getJobs: jest.fn(),
  clean: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
});

/**
 * Mock Logger
 */
export const createMockLogger = () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
});

/**
 * Mock TypesenseClient
 */
export const createMockTypesenseClient = () => ({
  collections: jest.fn(() => ({
    create: jest.fn(),
    retrieve: jest.fn(),
    documents: jest.fn(() => ({
      search: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      import: jest.fn(),
    })),
  })),
  health: {
    retrieve: jest.fn(() => ({ ok: true })),
  },
});

/**
 * Mock S3Client
 */
export const createMockS3Client = () => ({
  send: jest.fn(),
});

/**
 * Mock File Upload
 */
export const createMockFile = (
  filename = 'test.jpg',
  mimetype = 'image/jpeg',
  size = 1024,
): Express.Multer.File => ({
  fieldname: 'file',
  originalname: filename,
  encoding: '7bit',
  mimetype,
  size,
  buffer: Buffer.from('mock file content'),
  stream: null,
  destination: '',
  filename: '',
  path: '',
});

/**
 * Create test user
 */
export const createTestUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'TRAVELER',
  isActive: true,
  isVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Create test experience
 */
export const createTestExperience = (overrides = {}) => ({
  id: 'test-experience-id',
  title: 'Test Experience',
  description: 'Test description',
  category: 'adventure',
  location: 'Test Location',
  city: 'Test City',
  country: 'Test Country',
  price: 100000,
  duration: 8,
  maxGroupSize: 10,
  providerId: 'provider-id',
  isActive: true,
  averageRating: 4.5,
  reviewCount: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Create test booking
 */
export const createTestBooking = (overrides = {}) => ({
  id: 'test-booking-id',
  experienceId: 'experience-id',
  userId: 'user-id',
  date: new Date(),
  numberOfPeople: 2,
  totalPrice: 200000,
  status: 'PENDING',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Wait for async operations
 */
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock Mongoose Model
 */
export const createMockMongooseModel = () => ({
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnThis(),
  create: jest.fn(),
  save: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  exec: jest.fn(),
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
});
