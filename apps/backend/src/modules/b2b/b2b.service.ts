import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alliance, AllianceContract, AllianceTransaction } from './entities';
import {
  CreateAllianceDto,
  UpdateAllianceDto,
  CreateContractDto,
  UpdateContractDto,
  CreateTransactionDto,
  FilterAlliancesDto,
} from './dto';
import { AllianceStatus } from '@travelink/types';
import { TransactionStatus } from './entities/alliance-transaction.entity';

@Injectable()
export class B2BService {
  constructor(
    @InjectRepository(Alliance)
    private allianceRepository: Repository<Alliance>,
    @InjectRepository(AllianceContract)
    private contractRepository: Repository<AllianceContract>,
    @InjectRepository(AllianceTransaction)
    private transactionRepository: Repository<AllianceTransaction>,
  ) {}

  // ==================== ALLIANCES ====================

  async createAlliance(
    agencyId: string,
    dto: CreateAllianceDto,
  ): Promise<Alliance> {
    // Verificar que no exista ya una alianza activa con este proveedor
    const existing = await this.allianceRepository.findOne({
      where: {
        agencyId,
        providerId: dto.providerId,
        status: AllianceStatus.ACCEPTED,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Ya existe una alianza activa con este proveedor',
      );
    }

    const alliance = this.allianceRepository.create({
      ...dto,
      agencyId,
    });

    return await this.allianceRepository.save(alliance);
  }

  async getAlliances(filters: FilterAlliancesDto): Promise<{
    items: Alliance[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, ...where } = filters;
    const skip = (page - 1) * limit;

    const [items, total] = await this.allianceRepository.findAndCount({
      where,
      relations: ['agency', 'provider'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMyAlliances(
    userId: string,
    filters: FilterAlliancesDto,
  ): Promise<{
    items: Alliance[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, type, status } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.allianceRepository
      .createQueryBuilder('alliance')
      .leftJoinAndSelect('alliance.agency', 'agency')
      .leftJoinAndSelect('alliance.provider', 'provider')
      .where('alliance.agencyId = :userId OR alliance.providerId = :userId', {
        userId,
      });

    if (type) {
      queryBuilder.andWhere('alliance.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('alliance.status = :status', { status });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('alliance.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllianceById(id: string): Promise<Alliance> {
    const alliance = await this.allianceRepository.findOne({
      where: { id },
      relations: ['agency', 'provider', 'contracts', 'transactions'],
    });

    if (!alliance) {
      throw new NotFoundException('Alianza no encontrada');
    }

    return alliance;
  }

  async updateAlliance(
    id: string,
    userId: string,
    dto: UpdateAllianceDto,
  ): Promise<Alliance> {
    const alliance = await this.getAllianceById(id);

    // Solo la agencia puede editar la alianza
    if (alliance.agencyId !== userId) {
      throw new ForbiddenException('No tienes permisos para editar esta alianza');
    }

    // No se puede editar una alianza ya aceptada (solo pausar/terminar)
    if (
      alliance.status === AllianceStatus.ACCEPTED &&
      dto.status &&
      ![AllianceStatus.SUSPENDED, AllianceStatus.TERMINATED].includes(dto.status)
    ) {
      throw new BadRequestException(
        'No se puede modificar el estado de una alianza activa excepto para suspender o terminar',
      );
    }

    Object.assign(alliance, dto);

    if (dto.status === AllianceStatus.TERMINATED && !alliance.terminatedAt) {
      alliance.terminatedAt = new Date();
    }

    return await this.allianceRepository.save(alliance);
  }

  async deleteAlliance(id: string, userId: string): Promise<void> {
    const alliance = await this.getAllianceById(id);

    if (alliance.agencyId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar esta alianza');
    }

    // Solo se pueden eliminar alianzas en estado PENDING o REJECTED
    if (![AllianceStatus.PENDING, AllianceStatus.REJECTED].includes(alliance.status)) {
      throw new BadRequestException(
        'Solo se pueden eliminar alianzas pendientes o rechazadas',
      );
    }

    await this.allianceRepository.remove(alliance);
  }

  // Proveedor acepta la alianza
  async acceptAlliance(id: string, providerId: string): Promise<Alliance> {
    const alliance = await this.getAllianceById(id);

    if (alliance.providerId !== providerId) {
      throw new ForbiddenException('No tienes permisos para aceptar esta alianza');
    }

    if (alliance.status !== AllianceStatus.PENDING) {
      throw new BadRequestException('Solo se pueden aceptar alianzas pendientes');
    }

    alliance.status = AllianceStatus.ACCEPTED;
    alliance.acceptedAt = new Date();

    return await this.allianceRepository.save(alliance);
  }

  // Proveedor rechaza la alianza
  async rejectAlliance(
    id: string,
    providerId: string,
    reason: string,
  ): Promise<Alliance> {
    const alliance = await this.getAllianceById(id);

    if (alliance.providerId !== providerId) {
      throw new ForbiddenException('No tienes permisos para rechazar esta alianza');
    }

    if (alliance.status !== AllianceStatus.PENDING) {
      throw new BadRequestException('Solo se pueden rechazar alianzas pendientes');
    }

    alliance.status = AllianceStatus.REJECTED;
    alliance.rejectionReason = reason;
    alliance.rejectedAt = new Date();

    return await this.allianceRepository.save(alliance);
  }

  // ==================== CONTRACTS ====================

  async createContract(
    userId: string,
    dto: CreateContractDto,
  ): Promise<AllianceContract> {
    const alliance = await this.getAllianceById(dto.allianceId);

    // Solo agencia o proveedor pueden crear contratos
    if (alliance.agencyId !== userId && alliance.providerId !== userId) {
      throw new ForbiddenException('No tienes permisos para crear contratos en esta alianza');
    }

    // Verificar que la alianza esté aceptada
    if (alliance.status !== AllianceStatus.ACCEPTED) {
      throw new BadRequestException(
        'Solo se pueden crear contratos para alianzas aceptadas',
      );
    }

    const contract = this.contractRepository.create(dto);
    return await this.contractRepository.save(contract);
  }

  async getContractsByAlliance(allianceId: string): Promise<AllianceContract[]> {
    return await this.contractRepository.find({
      where: { allianceId },
      order: { createdAt: 'DESC' },
    });
  }

  async getContractById(id: string): Promise<AllianceContract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['alliance'],
    });

    if (!contract) {
      throw new NotFoundException('Contrato no encontrado');
    }

    return contract;
  }

  async updateContract(
    id: string,
    userId: string,
    dto: UpdateContractDto,
  ): Promise<AllianceContract> {
    const contract = await this.getContractById(id);
    const alliance = await this.getAllianceById(contract.allianceId);

    // Solo agencia o proveedor pueden actualizar contratos
    if (alliance.agencyId !== userId && alliance.providerId !== userId) {
      throw new ForbiddenException('No tienes permisos para actualizar este contrato');
    }

    Object.assign(contract, dto);

    // Marcar como firmado si ambas partes han firmado
    if (dto.agencySignatureUrl && dto.providerSignatureUrl && !contract.signedAt) {
      contract.signedAt = new Date();
    }

    return await this.contractRepository.save(contract);
  }

  async signContract(
    id: string,
    userId: string,
    signatureUrl: string,
  ): Promise<AllianceContract> {
    const contract = await this.getContractById(id);
    const alliance = await this.getAllianceById(contract.allianceId);

    // Determinar quién está firmando
    if (alliance.agencyId === userId) {
      contract.agencySignatureUrl = signatureUrl;
    } else if (alliance.providerId === userId) {
      contract.providerSignatureUrl = signatureUrl;
    } else {
      throw new ForbiddenException('No tienes permisos para firmar este contrato');
    }

    // Si ambas partes firmaron, marcar como firmado
    if (contract.agencySignatureUrl && contract.providerSignatureUrl) {
      contract.signedAt = new Date();
    }

    return await this.contractRepository.save(contract);
  }

  // ==================== TRANSACTIONS ====================

  async createTransaction(dto: CreateTransactionDto): Promise<AllianceTransaction> {
    const alliance = await this.getAllianceById(dto.allianceId);

    // Verificar que la alianza esté activa
    if (alliance.status !== AllianceStatus.ACCEPTED) {
      throw new BadRequestException(
        'Solo se pueden crear transacciones para alianzas activas',
      );
    }

    // Calcular total
    const taxAmount = dto.taxAmount || 0;
    const totalAmount = dto.commissionAmount + taxAmount;

    const transaction = this.transactionRepository.create({
      ...dto,
      taxAmount,
      totalAmount,
    });

    return await this.transactionRepository.save(transaction);
  }

  async getTransactionsByAlliance(allianceId: string): Promise<AllianceTransaction[]> {
    return await this.transactionRepository.find({
      where: { allianceId },
      relations: ['booking'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTransactionById(id: string): Promise<AllianceTransaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['alliance', 'booking'],
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    return transaction;
  }

  async markTransactionAsPaid(
    id: string,
    paymentReference: string,
  ): Promise<AllianceTransaction> {
    const transaction = await this.getTransactionById(id);

    if (transaction.status === TransactionStatus.PAID) {
      throw new BadRequestException('Esta transacción ya fue marcada como pagada');
    }

    transaction.status = TransactionStatus.PAID;
    transaction.paidAt = new Date();
    transaction.paymentReference = paymentReference;

    return await this.transactionRepository.save(transaction);
  }

  async cancelTransaction(id: string): Promise<AllianceTransaction> {
    const transaction = await this.getTransactionById(id);

    if (transaction.status === TransactionStatus.PAID) {
      throw new BadRequestException('No se puede cancelar una transacción ya pagada');
    }

    transaction.status = TransactionStatus.CANCELLED;

    return await this.transactionRepository.save(transaction);
  }

  // ==================== ANALYTICS ====================

  async getAllianceMetrics(allianceId: string): Promise<{
    totalTransactions: number;
    totalCommissions: number;
    pendingCommissions: number;
    paidCommissions: number;
    averageCommission: number;
  }> {
    const transactions = await this.getTransactionsByAlliance(allianceId);

    const totalTransactions = transactions.length;
    const totalCommissions = transactions.reduce(
      (sum, t) => sum + Number(t.commissionAmount),
      0,
    );
    const pendingCommissions = transactions
      .filter((t) => t.status === TransactionStatus.PENDING)
      .reduce((sum, t) => sum + Number(t.totalAmount), 0);
    const paidCommissions = transactions
      .filter((t) => t.status === TransactionStatus.PAID)
      .reduce((sum, t) => sum + Number(t.totalAmount), 0);
    const averageCommission =
      totalTransactions > 0 ? totalCommissions / totalTransactions : 0;

    return {
      totalTransactions,
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      averageCommission,
    };
  }
}
