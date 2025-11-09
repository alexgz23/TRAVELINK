# Testing Strategy - Viajero Conectado Backend

## Overview

El backend de Viajero Conectado implementa una estrategia de testing completa que incluye:
- ✅ **Unit Tests** con Jest
- ✅ **E2E Tests** con Supertest
- ✅ **Test Coverage** tracking
- ✅ **Mock Utilities** para testing consistente
- ⏳ **Integration Tests** (futuro)

## Test Structure

```
apps/backend/src/
├── modules/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   └── auth.service.spec.ts ✅
│   ├── users/
│   │   ├── users.service.ts
│   │   └── users.service.spec.ts ✅
│   └── [other modules]...
├── common/
│   └── guards/
│       ├── jwt-auth.guard.spec.ts ✅
│       └── roles.guard.spec.ts ✅
├── media/
│   ├── media.service.ts
│   └── media.service.spec.ts ✅
├── search/
│   ├── search.service.ts
│   └── search.service.spec.ts ✅
└── test-utils/
    └── mocks.ts ✅ (Test utilities)
```

## Jest Configuration

**File:** `apps/backend/jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
};
```

## Test Utilities

### Mock Helpers (`src/test-utils/mocks.ts`)

Utilidades reutilizables para crear mocks consistentes:

#### Repository Mocks
```typescript
const mockRepository = createMockRepository<User>();
mockRepository.find.mockResolvedValue([mockUser]);
```

#### Service Mocks
```typescript
const mockJwtService = createMockJwtService();
const mockConfigService = createMockConfigService({
  JWT_SECRET: 'test-secret',
});
const mockCacheService = createMockCacheService();
```

#### Queue Mocks
```typescript
const mockQueue = createMockQueue();
mockQueue.add.mockResolvedValue({});
```

#### Test Data Factories
```typescript
const testUser = createTestUser({
  email: 'custom@example.com',
  role: 'GUIDE',
});

const testExperience = createTestExperience({
  price: 500000,
  category: 'adventure',
});
```

## Unit Tests

### Service Tests Pattern

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: createMockUsersService() },
        { provide: JwtService, useValue: createMockJwtService() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
  });

  it('should register a new user', async () => {
    // Arrange
    const registerDto = { email: 'test@example.com', password: 'pass' };
    usersService.create.mockResolvedValue(mockUser);

    // Act
    const result = await service.register(registerDto);

    // Assert
    expect(result.user.email).toBe('test@example.com');
    expect(usersService.create).toHaveBeenCalled();
  });
});
```

### Testing Best Practices

✅ **DO**:
- Use Arrange-Act-Assert pattern
- Mock external dependencies
- Test happy paths AND error cases
- Use descriptive test names
- Clean up after each test

❌ **DON'T**:
- Test implementation details
- Mock what you're testing
- Write interdependent tests
- Skip error case testing

## E2E Tests

### E2E Test Structure

**File:** `apps/backend/test/app.e2e-spec.ts`

```typescript
describe('Auth E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'TRAVELER',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### E2E Configuration

**File:** `test/jest-e2e.json`

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

## Test Coverage

### Running Coverage

```bash
# Run tests with coverage
pnpm test:cov

# View HTML coverage report
open coverage/lcov-report/index.html
```

### Coverage Goals

| Metric | Goal | Current |
|--------|------|---------|
| Statements | >80% | ~75% |
| Branches | >75% | ~70% |
| Functions | >80% | ~72% |
| Lines | >80% | ~75% |

### Coverage Configuration

```javascript
// jest.config.js
collectCoverageFrom: [
  '**/*.(t|j)s',
  '!**/*.spec.ts',
  '!**/*.e2e-spec.ts',
  '!**/node_modules/**',
  '!**/dist/**',
],
coverageDirectory: '../coverage',
coverageReporters: ['text', 'lcov', 'html'],
```

## Test Commands

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e

# Run specific test file
pnpm test -- auth.service.spec

# Run tests with verbose output
pnpm test -- --verbose

# Debug tests
pnpm test:debug
```

## Mocking Strategies

### Mocking TypeORM Repositories

```typescript
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// In test
mockRepository.findOne.mockResolvedValue(mockUser);
```

### Mocking External Services

```typescript
// Mock S3 Client
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(() => ({
    send: jest.fn().mockResolvedValue({}),
  })),
  PutObjectCommand: jest.fn(),
}));

// Mock Typesense
jest.mock('typesense', () => ({
  Client: jest.fn(() => ({
    collections: jest.fn(() => ({
      documents: jest.fn(() => ({
        search: jest.fn().mockResolvedValue({ hits: [] }),
      })),
    })),
  })),
}));
```

### Mocking Modules

```typescript
// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}));
```

## Testing Specific Components

### Testing Controllers

```typescript
describe('ExperiencesController', () => {
  let controller: ExperiencesController;
  let service: jest.Mocked<ExperiencesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExperiencesController],
      providers: [
        {
          provide: ExperiencesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ExperiencesController>(ExperiencesController);
    service = module.get(ExperiencesService);
  });

  it('should return all experiences', async () => {
    const mockExperiences = [createTestExperience()];
    service.findAll.mockResolvedValue(mockExperiences);

    const result = await controller.findAll({});

    expect(result).toEqual(mockExperiences);
    expect(service.findAll).toHaveBeenCalled();
  });
});
```

### Testing Guards

```typescript
describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it('should allow public routes', () => {
    const context = createMockExecutionContext();
    reflector.getAllAndOverride = jest.fn().mockReturnValue(true);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });
});
```

### Testing Async Operations

```typescript
it('should handle async file upload', async () => {
  const mockFile = createMockFile();
  const uploadPromise = mediaService.uploadFile(mockFile, 'user-123', 'post');

  // Wait for async operation
  await expect(uploadPromise).resolves.toMatchObject({
    url: expect.stringContaining('https://'),
    status: 'processing',
  });

  // Verify queue was called
  expect(imageQueue.add).toHaveBeenCalled();
});
```

## CI/CD Integration

### GitHub Actions

**File:** `.github/workflows/ci.yml`

```yaml
- name: Unit Tests
  run: pnpm test

- name: E2E Tests
  run: pnpm test:e2e
  env:
    NODE_ENV: test
    DB_HOST: localhost
    REDIS_HOST: localhost

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Debugging Tests

### VSCode Debug Configuration

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": [
    "--runInBand",
    "--testPathPattern",
    "${file}"
  ],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Debug Single Test

```bash
# Add debugger; statement in test
it('should debug this test', () => {
  debugger;
  expect(true).toBe(true);
});

# Run with debug
pnpm test:debug -- auth.service.spec
```

## Common Testing Patterns

### Testing Exceptions

```typescript
it('should throw NotFoundException when user not found', async () => {
  mockRepository.findOne.mockResolvedValue(null);

  await expect(service.findOne('non-existent-id'))
    .rejects
    .toThrow(NotFoundException);
});
```

### Testing Validation

```typescript
it('should validate email format', async () => {
  const invalidDto = { email: 'invalid-email', password: 'pass' };

  await expect(service.register(invalidDto))
    .rejects
    .toThrow(BadRequestException);
});
```

### Testing Pagination

```typescript
it('should paginate results', async () => {
  const mockResults = Array.from({ length: 25 }, (_, i) => 
    createTestExperience({ id: `exp-${i}` })
  );
  
  mockRepository.find.mockResolvedValue(mockResults.slice(0, 10));

  const result = await service.findAll({ page: 1, limit: 10 });

  expect(result.data).toHaveLength(10);
  expect(result.total).toBe(25);
  expect(result.pages).toBe(3);
});
```

## Performance Testing

### Test Execution Time

```typescript
it('should complete search in <100ms', async () => {
  const start = Date.now();
  
  await searchService.searchExperiences({ q: 'test' });
  
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(100);
});
```

## Future Enhancements

### Short-term
- [ ] Increase unit test coverage to >80%
- [ ] Add integration tests for critical flows
- [ ] Implement visual regression testing
- [ ] Add performance benchmarks

### Long-term
- [ ] Contract testing for API contracts
- [ ] Mutation testing for test quality
- [ ] Property-based testing
- [ ] Load testing with k6

## Resources

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## Support

For testing issues:
1. Check test output for specific errors
2. Verify mocks are properly configured
3. Review this documentation
4. Check Jest configuration

**Run Tests:** `pnpm test`  
**Coverage Report:** `pnpm test:cov`
