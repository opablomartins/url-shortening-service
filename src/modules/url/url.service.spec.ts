import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UrlResponseDto } from './dto/url-response.dto';
import { Url } from './entities/url.entity';
import { UrlRepository } from './url.repository';
import { UrlService } from './url.service';

const mockUrl = (): Url =>
  ({
    id: 'uuid-1234',
    url: 'https://www.example.com/some/long/url',
    shortCode: 'abc123',
    accessCount: 5,
    createdAt: new Date('2026-01-01T12:00:00Z'),
    updatedAt: new Date('2026-01-01T12:00:00Z'),
  }) as Url;

const mockUrlRepository = () => ({
  save: jest.fn(),
  findByCode: jest.fn(),
  incrementAccessCount: jest.fn(),
  updateUrl: jest.fn(),
  deleteByCode: jest.fn(),
});

describe('UrlService', () => {
  let service: UrlService;
  let repository: ReturnType<typeof mockUrlRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        { provide: UrlRepository, useFactory: mockUrlRepository },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    repository = module.get(UrlRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create and return a UrlResponseDto without accessCount', async () => {
      const url = mockUrl();
      repository.findByCode.mockResolvedValue(null);
      repository.save.mockResolvedValue(url);

      const result = await service.create({ url: url.url });

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Object);
      expect(result).not.toHaveProperty('accessCount');
      expect(result.shortCode).toBe(url.shortCode);
      expect(result.url).toBe(url.url);
    });

    it('should retry on short code collision and succeed on second attempt', async () => {
      const url = mockUrl();
      repository.findByCode
        .mockResolvedValueOnce(mockUrl())
        .mockResolvedValueOnce(null);
      repository.save.mockResolvedValue(url);

      const result = await service.create({ url: url.url });

      expect(repository.findByCode).toHaveBeenCalledTimes(2);
      expect(result.url).toBe(url.url);
    });

    it('should throw ConflictException after max retries', async () => {
      repository.findByCode.mockResolvedValue(mockUrl());

      await expect(service.create({ url: 'https://example.com' })).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findByCode).toHaveBeenCalledTimes(3);
    });
  });

  describe('findByCode', () => {
    it('should return a UrlResponseDto and increment access count', async () => {
      const url = mockUrl();
      repository.findByCode.mockResolvedValue(url);
      repository.incrementAccessCount.mockResolvedValue(undefined);

      const result = await service.findByCode('abc123');

      expect(repository.incrementAccessCount).toHaveBeenCalledWith('abc123');
      expect(result).not.toHaveProperty('accessCount');
      expect(result).toEqual(UrlResponseDto.fromEntity(url));
    });

    it('should throw NotFoundException when short code does not exist', async () => {
      repository.findByCode.mockResolvedValue(null);

      await expect(service.findByCode('notfound')).rejects.toThrow(NotFoundException);
      expect(repository.incrementAccessCount).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return the updated URL without accessCount', async () => {
      const original = mockUrl();
      const updated = { ...original, url: 'https://updated.com' } as Url;

      repository.findByCode.mockResolvedValue(original);
      repository.updateUrl.mockResolvedValue(updated);

      const result = await service.update('abc123', { url: 'https://updated.com' });

      expect(repository.updateUrl).toHaveBeenCalledWith('abc123', 'https://updated.com');
      expect(result.url).toBe('https://updated.com');
      expect(result).not.toHaveProperty('accessCount');
    });

    it('should throw NotFoundException when short code does not exist', async () => {
      repository.findByCode.mockResolvedValue(null);

      await expect(
        service.update('notfound', { url: 'https://example.com' }),
      ).rejects.toThrow(NotFoundException);
      expect(repository.updateUrl).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete successfully when short code exists', async () => {
      repository.deleteByCode.mockResolvedValue(true);

      await expect(service.remove('abc123')).resolves.toBeUndefined();
      expect(repository.deleteByCode).toHaveBeenCalledWith('abc123');
    });

    it('should throw NotFoundException when short code does not exist', async () => {
      repository.deleteByCode.mockResolvedValue(false);

      await expect(service.remove('notfound')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return the full entity including accessCount', async () => {
      const url = mockUrl();
      repository.findByCode.mockResolvedValue(url);

      const result = await service.getStats('abc123');

      expect(result).toHaveProperty('accessCount', 5);
      expect(result).toEqual(url);
    });

    it('should throw NotFoundException when short code does not exist', async () => {
      repository.findByCode.mockResolvedValue(null);

      await expect(service.getStats('notfound')).rejects.toThrow(NotFoundException);
    });
  });
});
