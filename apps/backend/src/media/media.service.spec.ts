import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MediaService } from './media.service';
import { StorageService } from './storage.service';
import { Media, MediaType, MediaCategory, MediaStatus } from './entities/media.entity';
import { QueueName } from '../queues/constants';
import {
  createMockRepository,
  createMockQueue,
  createMockFile,
  createTestUser,
} from '../test-utils/mocks';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-1234'),
}));

describe('MediaService', () => {
  let service: MediaService;
  let mediaRepository: jest.Mocked<Repository<Media>>;
  let storageService: jest.Mocked<StorageService>;
  let imageQueue: jest.Mocked<Queue>;

  const mockMedia = {
    id: 'media-123',
    originalName: 'test.jpg',
    key: 'posts/2024/01/uuid-test.jpg',
    url: 'https://cdn.example.com/posts/2024/01/uuid-test.jpg',
    type: MediaType.IMAGE,
    category: MediaCategory.POST,
    status: MediaStatus.READY,
    mimeType: 'image/jpeg',
    size: 1024000,
    width: 1920,
    height: 1080,
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: getRepositoryToken(Media),
          useValue: createMockRepository(),
        },
        {
          provide: StorageService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
            getFile: jest.fn(),
            getSignedUrl: jest.fn(),
          },
        },
        {
          provide: getQueueToken(QueueName.IMAGE_PROCESSING),
          useValue: createMockQueue(),
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    mediaRepository = module.get(getRepositoryToken(Media));
    storageService = module.get(StorageService);
    imageQueue = module.get(getQueueToken(QueueName.IMAGE_PROCESSING));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    const mockFile = createMockFile('test.jpg', 'image/jpeg', 1024000);
    const userId = 'user-123';
    const category = MediaCategory.POST;

    it('should successfully upload an image file', async () => {
      // Arrange
      const uploadedUrl = 'https://cdn.example.com/posts/2024/01/uuid-test.jpg';
      mediaRepository.create.mockReturnValue(mockMedia as any);
      mediaRepository.save.mockResolvedValue(mockMedia as any);
      storageService.uploadFile.mockResolvedValue(uploadedUrl);
      imageQueue.add.mockResolvedValue({} as any);

      // Act
      const result = await service.uploadFile(mockFile, userId, category);

      // Assert
      expect(mediaRepository.create).toHaveBeenCalled();
      expect(storageService.uploadFile).toHaveBeenCalledWith(
        expect.stringContaining('posts'),
        mockFile.buffer,
        mockFile.mimetype,
        expect.any(Object),
      );
      expect(mediaRepository.save).toHaveBeenCalledTimes(2);
      expect(imageQueue.add).toHaveBeenCalled();
      expect(result.url).toBe(uploadedUrl);
      expect(result.status).toBe(MediaStatus.PROCESSING);
    });

    it('should handle video files without queuing for image processing', async () => {
      // Arrange
      const videoFile = createMockFile('video.mp4', 'video/mp4', 5000000);
      const uploadedUrl = 'https://cdn.example.com/posts/2024/01/uuid-video.mp4';
      const videoMedia = { ...mockMedia, type: MediaType.VIDEO, status: MediaStatus.READY };
      
      mediaRepository.create.mockReturnValue(videoMedia as any);
      mediaRepository.save.mockResolvedValue(videoMedia as any);
      storageService.uploadFile.mockResolvedValue(uploadedUrl);

      // Act
      const result = await service.uploadFile(videoFile, userId, category);

      // Assert
      expect(imageQueue.add).not.toHaveBeenCalled();
      expect(result.status).toBe(MediaStatus.READY);
    });

    it('should validate file size for images', async () => {
      // Arrange
      const largeFile = createMockFile('large.jpg', 'image/jpeg', 20 * 1024 * 1024); // 20MB

      // Act & Assert
      await expect(service.uploadFile(largeFile, userId, category)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate MIME type', async () => {
      // Arrange
      const invalidFile = createMockFile('script.exe', 'application/exe', 1024);

      // Act & Assert
      await expect(service.uploadFile(invalidFile, userId, category)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should cleanup database record if upload fails', async () => {
      // Arrange
      mediaRepository.create.mockReturnValue(mockMedia as any);
      mediaRepository.save.mockResolvedValueOnce(mockMedia as any);
      storageService.uploadFile.mockRejectedValue(new Error('Upload failed'));
      mediaRepository.delete.mockResolvedValue({} as any);

      // Act & Assert
      await expect(service.uploadFile(mockFile, userId, category)).rejects.toThrow('Upload failed');
      expect(mediaRepository.delete).toHaveBeenCalledWith(mockMedia.id);
    });
  });

  describe('uploadFiles', () => {
    it('should upload multiple files', async () => {
      // Arrange
      const files = [
        createMockFile('test1.jpg'),
        createMockFile('test2.jpg'),
        createMockFile('test3.jpg'),
      ];
      const userId = 'user-123';
      
      mediaRepository.create.mockReturnValue(mockMedia as any);
      mediaRepository.save.mockResolvedValue(mockMedia as any);
      storageService.uploadFile.mockResolvedValue('https://cdn.example.com/file.jpg');
      imageQueue.add.mockResolvedValue({} as any);

      // Act
      const results = await service.uploadFiles(files, userId, MediaCategory.POST);

      // Assert
      expect(results).toHaveLength(3);
      expect(storageService.uploadFile).toHaveBeenCalledTimes(3);
      expect(imageQueue.add).toHaveBeenCalledTimes(3);
    });
  });

  describe('findOne', () => {
    it('should return media when found', async () => {
      // Arrange
      const userId = 'user-123';
      mediaRepository.findOne.mockResolvedValue(mockMedia as any);

      // Act
      const result = await service.findOne(mockMedia.id, userId);

      // Assert
      expect(mediaRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockMedia.id, userId },
      });
      expect(result).toEqual(mockMedia);
    });

    it('should throw NotFoundException when media not found', async () => {
      // Arrange
      mediaRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('non-existent', 'user-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all media for user', async () => {
      // Arrange
      const userId = 'user-123';
      const mockMediaList = [mockMedia, { ...mockMedia, id: 'media-456' }];
      
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockMediaList),
      };
      
      mediaRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.findAll(userId);

      // Assert
      expect(result).toEqual(mockMediaList);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('media.userId = :userId', { userId });
    });

    it('should filter by category when provided', async () => {
      // Arrange
      const userId = 'user-123';
      const category = MediaCategory.AVATAR;
      
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockMedia]),
      };
      
      mediaRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      // Act
      await service.findAll(userId, category);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('media.category = :category', {
        category,
      });
    });
  });

  describe('deleteMedia', () => {
    it('should soft delete media', async () => {
      // Arrange
      const userId = 'user-123';
      mediaRepository.findOne.mockResolvedValue(mockMedia as any);
      mediaRepository.save.mockResolvedValue({ ...mockMedia, deletedAt: new Date() } as any);

      // Act
      await service.deleteMedia(mockMedia.id, userId);

      // Assert
      expect(mediaRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      );
    });

    it('should throw NotFoundException if media not found', async () => {
      // Arrange
      mediaRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteMedia('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateAfterProcessing', () => {
    it('should update media with processing results', async () => {
      // Arrange
      const processingData = {
        width: 1920,
        height: 1080,
        variants: {
          thumbnail: 'https://cdn.example.com/thumb.jpg',
          small: 'https://cdn.example.com/small.jpg',
        },
        metadata: { format: 'jpeg' },
      };
      
      mediaRepository.findOne.mockResolvedValue(mockMedia as any);
      mediaRepository.save.mockResolvedValue({
        ...mockMedia,
        ...processingData,
        status: MediaStatus.READY,
      } as any);

      // Act
      const result = await service.updateAfterProcessing(mockMedia.id, processingData);

      // Assert
      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
      expect(result.status).toBe(MediaStatus.READY);
      expect(result.variants).toEqual(processingData.variants);
    });

    it('should throw NotFoundException if media not found', async () => {
      // Arrange
      mediaRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateAfterProcessing('non-existent', { width: 100, height: 100 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserStorageStats', () => {
    it('should calculate storage statistics correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const mockMediaList = [
        { ...mockMedia, size: 1024000, category: MediaCategory.POST },
        { ...mockMedia, id: 'media-2', size: 2048000, category: MediaCategory.POST },
        { ...mockMedia, id: 'media-3', size: 512000, category: MediaCategory.AVATAR },
      ];
      
      mediaRepository.find.mockResolvedValue(mockMediaList as any);

      // Act
      const stats = await service.getUserStorageStats(userId);

      // Assert
      expect(stats.totalFiles).toBe(3);
      expect(stats.totalSize).toBe(3584000); // 1024000 + 2048000 + 512000
      expect(stats.byCategory[MediaCategory.POST].count).toBe(2);
      expect(stats.byCategory[MediaCategory.POST].size).toBe(3072000);
      expect(stats.byCategory[MediaCategory.AVATAR].count).toBe(1);
      expect(stats.byCategory[MediaCategory.AVATAR].size).toBe(512000);
    });

    it('should return zero stats for user with no media', async () => {
      // Arrange
      mediaRepository.find.mockResolvedValue([]);

      // Act
      const stats = await service.getUserStorageStats('user-123');

      // Assert
      expect(stats.totalFiles).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(Object.keys(stats.byCategory)).toHaveLength(0);
    });
  });
});
