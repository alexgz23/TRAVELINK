import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere } from 'typeorm';
import {
  Experience,
  ExperienceVariant,
  ExperienceMedia,
  ExperienceItinerary,
} from './entities';
import {
  CreateExperienceDto,
  UpdateExperienceDto,
  FilterExperienceDto,
  CreateVariantDto,
  CreateMediaDto,
  CreateItineraryDto,
} from './dto';
import { ExperienceStatus } from '@viajero-conectado/types';
import { slugify } from '@viajero-conectado/shared';
import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export class ExperiencesService {
  constructor(
    @InjectRepository(Experience)
    private readonly experienceRepository: Repository<Experience>,
    @InjectRepository(ExperienceVariant)
    private readonly variantRepository: Repository<ExperienceVariant>,
    @InjectRepository(ExperienceMedia)
    private readonly mediaRepository: Repository<ExperienceMedia>,
    @InjectRepository(ExperienceItinerary)
    private readonly itineraryRepository: Repository<ExperienceItinerary>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('ExperiencesService');
  }

  /**
   * Crear nueva experiencia
   */
  async create(agencyId: string, createDto: CreateExperienceDto): Promise<Experience> {
    const slug = await this.generateUniqueSlug(createDto.title);

    const experience = this.experienceRepository.create({
      agencyId,
      title: createDto.title,
      slug,
      description: createDto.description,
      shortDescription: createDto.shortDescription,
      category: createDto.category,
      subcategory: createDto.subcategory,
      locationCountry: createDto.location.country,
      locationCity: createDto.location.city,
      locationAddress: createDto.location.address,
      locationLat: createDto.location.latitude,
      locationLng: createDto.location.longitude,
      durationHours: createDto.durationHours,
      difficultyLevel: createDto.difficultyLevel,
      minAge: createDto.minAge,
      maxGroupSize: createDto.maxGroupSize,
      languages: createDto.languages,
      priceFrom: createDto.priceFrom,
      currency: createDto.currency,
      status: ExperienceStatus.DRAFT,
    });

    const saved = await this.experienceRepository.save(experience);

    this.logger.business('create', 'experience', saved.id, {
      agencyId,
      title: saved.title,
      slug: saved.slug,
      category: createDto.category,
    });

    return saved;
  }

  /**
   * Buscar experiencias con filtros
   */
  async findAll(filters: FilterExperienceDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Experience> = {
      status: ExperienceStatus.PUBLISHED,
    };

    // Aplicar filtros
    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.country) {
      where.locationCountry = filters.country;
    }

    if (filters.city) {
      where.locationCity = Like(`%${filters.city}%`);
    }

    if (filters.difficultyLevel) {
      where.difficultyLevel = filters.difficultyLevel;
    }

    if (filters.featured !== undefined) {
      where.featured = filters.featured;
    }

    // Filtro de precio
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const min = filters.minPrice || 0;
      const max = filters.maxPrice || 999999999;
      where.priceFrom = Between(min, max);
    }

    // Búsqueda de texto
    let queryBuilder = this.experienceRepository
      .createQueryBuilder('experience')
      .leftJoinAndSelect('experience.agency', 'agency')
      .leftJoinAndSelect('agency.profile', 'profile')
      .leftJoinAndSelect('experience.media', 'media')
      .where(where);

    if (filters.search) {
      queryBuilder = queryBuilder.andWhere(
        '(experience.title ILIKE :search OR experience.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Filtro de idioma
    if (filters.language) {
      queryBuilder = queryBuilder.andWhere(':language = ANY(experience.languages)', {
        language: filters.language,
      });
    }

    // Ordenamiento
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'DESC';
    queryBuilder = queryBuilder.orderBy(`experience.${sortBy}`, sortOrder);

    // Paginación
    const [items, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Buscar experiencia por ID
   */
  async findOne(id: string): Promise<Experience> {
    const experience = await this.experienceRepository.findOne({
      where: { id },
      relations: ['agency', 'agency.profile', 'variants', 'media', 'itineraries'],
    });

    if (!experience) {
      throw new NotFoundException('Experiencia no encontrada');
    }

    return experience;
  }

  /**
   * Buscar experiencia por slug
   */
  async findBySlug(slug: string): Promise<Experience> {
    const experience = await this.experienceRepository.findOne({
      where: { slug, status: ExperienceStatus.PUBLISHED },
      relations: ['agency', 'agency.profile', 'variants', 'media', 'itineraries'],
    });

    if (!experience) {
      throw new NotFoundException('Experiencia no encontrada');
    }

    return experience;
  }

  /**
   * Obtener experiencias de una agencia
   */
  async findByAgency(agencyId: string): Promise<Experience[]> {
    return this.experienceRepository.find({
      where: { agencyId },
      relations: ['variants', 'media'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar experiencia
   */
  async update(
    id: string,
    userId: string,
    updateDto: UpdateExperienceDto,
  ): Promise<Experience> {
    const experience = await this.findOne(id);

    // Verificar que el usuario sea el dueño
    if (experience.agencyId !== userId) {
      this.logger.security('Unauthorized experience update attempt', 'medium', {
        experienceId: id,
        agencyId: experience.agencyId,
        attemptedBy: userId,
      });
      throw new ForbiddenException('No tienes permisos para actualizar esta experiencia');
    }

    // Si se actualiza el título, regenerar slug
    if (updateDto.title && updateDto.title !== experience.title) {
      experience.slug = await this.generateUniqueSlug(updateDto.title);
    }

    // Actualizar ubicación si viene
    if (updateDto.location) {
      experience.locationCountry = updateDto.location.country;
      experience.locationCity = updateDto.location.city;
      experience.locationAddress = updateDto.location.address;
      experience.locationLat = updateDto.location.latitude;
      experience.locationLng = updateDto.location.longitude;
    }

    // Actualizar otros campos
    Object.assign(experience, {
      title: updateDto.title,
      description: updateDto.description,
      shortDescription: updateDto.shortDescription,
      category: updateDto.category,
      subcategory: updateDto.subcategory,
      durationHours: updateDto.durationHours,
      difficultyLevel: updateDto.difficultyLevel,
      minAge: updateDto.minAge,
      maxGroupSize: updateDto.maxGroupSize,
      languages: updateDto.languages,
      priceFrom: updateDto.priceFrom,
      currency: updateDto.currency,
    });

    const updated = await this.experienceRepository.save(experience);

    this.logger.business('update', 'experience', id, {
      userId,
      fields: Object.keys(updateDto),
    });

    return updated;
  }

  /**
   * Eliminar experiencia
   */
  async remove(id: string, userId: string): Promise<void> {
    const experience = await this.findOne(id);

    if (experience.agencyId !== userId) {
      this.logger.security('Unauthorized experience deletion attempt', 'high', {
        experienceId: id,
        agencyId: experience.agencyId,
        attemptedBy: userId,
      });
      throw new ForbiddenException('No tienes permisos para eliminar esta experiencia');
    }

    await this.experienceRepository.remove(experience);

    this.logger.business('delete', 'experience', id, {
      userId,
      title: experience.title,
    });
  }

  /**
   * Publicar experiencia
   */
  async publish(id: string, userId: string): Promise<Experience> {
    const experience = await this.findOne(id);

    if (experience.agencyId !== userId) {
      this.logger.security('Unauthorized experience publish attempt', 'medium', {
        experienceId: id,
        agencyId: experience.agencyId,
        attemptedBy: userId,
      });
      throw new ForbiddenException('No tienes permisos para publicar esta experiencia');
    }

    // Validar que tenga al menos una variante
    if (!experience.variants || experience.variants.length === 0) {
      this.logger.warn('Experience publish failed: No variants', 'ExperiencesService', {
        experienceId: id,
      });
      throw new BadRequestException('Debes agregar al menos una variante antes de publicar');
    }

    // Validar que tenga al menos una imagen
    if (!experience.media || experience.media.length === 0) {
      this.logger.warn('Experience publish failed: No media', 'ExperiencesService', {
        experienceId: id,
      });
      throw new BadRequestException('Debes agregar al menos una imagen antes de publicar');
    }

    experience.status = ExperienceStatus.PUBLISHED;
    const published = await this.experienceRepository.save(experience);

    this.logger.business('publish', 'experience', id, {
      userId,
      title: experience.title,
    });

    return published;
  }

  /**
   * Pausar experiencia
   */
  async pause(id: string, userId: string): Promise<Experience> {
    const experience = await this.findOne(id);

    if (experience.agencyId !== userId) {
      throw new ForbiddenException('No tienes permisos para pausar esta experiencia');
    }

    experience.status = ExperienceStatus.PAUSED;
    return this.experienceRepository.save(experience);
  }

  // ========== Variantes ==========

  /**
   * Agregar variante
   */
  async addVariant(experienceId: string, createDto: CreateVariantDto): Promise<ExperienceVariant> {
    const experience = await this.findOne(experienceId);

    const variant = this.variantRepository.create({
      experienceId,
      ...createDto,
    });

    const saved = await this.variantRepository.save(variant);

    // Actualizar priceFrom si es menor
    if (saved.price < experience.priceFrom) {
      experience.priceFrom = saved.price;
      await this.experienceRepository.save(experience);
    }

    return saved;
  }

  /**
   * Actualizar variante
   */
  async updateVariant(
    variantId: string,
    updateDto: Partial<CreateVariantDto>,
  ): Promise<ExperienceVariant> {
    const variant = await this.variantRepository.findOne({ where: { id: variantId } });

    if (!variant) {
      throw new NotFoundException('Variante no encontrada');
    }

    Object.assign(variant, updateDto);
    return this.variantRepository.save(variant);
  }

  /**
   * Eliminar variante
   */
  async removeVariant(variantId: string): Promise<void> {
    const variant = await this.variantRepository.findOne({ where: { id: variantId } });

    if (!variant) {
      throw new NotFoundException('Variante no encontrada');
    }

    await this.variantRepository.remove(variant);
  }

  // ========== Media ==========

  /**
   * Agregar media
   */
  async addMedia(experienceId: string, createDto: CreateMediaDto): Promise<ExperienceMedia> {
    await this.findOne(experienceId); // Verificar que exista

    const media = this.mediaRepository.create({
      experienceId,
      ...createDto,
    });

    return this.mediaRepository.save(media);
  }

  /**
   * Eliminar media
   */
  async removeMedia(mediaId: string): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { id: mediaId } });

    if (!media) {
      throw new NotFoundException('Media no encontrada');
    }

    await this.mediaRepository.remove(media);
  }

  // ========== Itinerario ==========

  /**
   * Agregar día de itinerario
   */
  async addItinerary(
    experienceId: string,
    createDto: CreateItineraryDto,
  ): Promise<ExperienceItinerary> {
    await this.findOne(experienceId);

    const itinerary = this.itineraryRepository.create({
      experienceId,
      ...createDto,
    });

    return this.itineraryRepository.save(itinerary);
  }

  /**
   * Actualizar itinerario
   */
  async updateItinerary(
    itineraryId: string,
    updateDto: Partial<CreateItineraryDto>,
  ): Promise<ExperienceItinerary> {
    const itinerary = await this.itineraryRepository.findOne({ where: { id: itineraryId } });

    if (!itinerary) {
      throw new NotFoundException('Itinerario no encontrado');
    }

    Object.assign(itinerary, updateDto);
    return this.itineraryRepository.save(itinerary);
  }

  /**
   * Eliminar itinerario
   */
  async removeItinerary(itineraryId: string): Promise<void> {
    const itinerary = await this.itineraryRepository.findOne({ where: { id: itineraryId } });

    if (!itinerary) {
      throw new NotFoundException('Itinerario no encontrado');
    }

    await this.itineraryRepository.remove(itinerary);
  }

  // ========== Helpers ==========

  /**
   * Generar slug único
   */
  private async generateUniqueSlug(title: string): Promise<string> {
    let slug = slugify(title);
    let counter = 1;

    while (await this.experienceRepository.findOne({ where: { slug } })) {
      slug = `${slugify(title)}-${counter}`;
      counter++;
    }

    return slug;
  }
}
