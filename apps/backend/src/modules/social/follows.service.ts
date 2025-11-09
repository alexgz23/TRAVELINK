import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Follow, FollowDocument } from './schemas';

@Injectable()
export class FollowsService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
  ) {}

  /**
   * Seguir a un usuario
   */
  async follow(followerId: string, followingId: string): Promise<FollowDocument> {
    if (followerId === followingId) {
      throw new BadRequestException('No puedes seguirte a ti mismo');
    }

    // Verificar que no exista ya
    const existingFollow = await this.followModel
      .findOne({ followerId, followingId })
      .exec();

    if (existingFollow) {
      return existingFollow; // Ya existe, retornar el mismo
    }

    const follow = new this.followModel({
      followerId,
      followingId,
    });

    return follow.save();
  }

  /**
   * Dejar de seguir a un usuario
   */
  async unfollow(followerId: string, followingId: string): Promise<void> {
    const follow = await this.followModel
      .findOne({ followerId, followingId })
      .exec();

    if (!follow) {
      throw new NotFoundException('No estás siguiendo a este usuario');
    }

    await this.followModel.deleteOne({ _id: follow._id }).exec();
  }

  /**
   * Verificar si un usuario sigue a otro
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followModel
      .findOne({ followerId, followingId })
      .exec();

    return !!follow;
  }

  /**
   * Obtener usuarios que sigo
   */
  async getFollowing(followerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.followModel.find({ followerId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.followModel.countDocuments({ followerId }).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener mis seguidores
   */
  async getFollowers(followingId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.followModel.find({ followingId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.followModel.countDocuments({ followingId }).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener contadores de seguidos/seguidores
   */
  async getCounts(userId: string) {
    const [followingCount, followersCount] = await Promise.all([
      this.followModel.countDocuments({ followerId: userId }).exec(),
      this.followModel.countDocuments({ followingId: userId }).exec(),
    ]);

    return {
      following: followingCount,
      followers: followersCount,
    };
  }

  /**
   * Obtener IDs de usuarios que sigo (para feed)
   */
  async getFollowingIds(userId: string): Promise<string[]> {
    const follows = await this.followModel
      .find({ followerId: userId })
      .select('followingId')
      .exec();

    return follows.map((f) => f.followingId);
  }
}
