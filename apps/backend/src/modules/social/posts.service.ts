import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument, Comment, CommentDocument, Like, LikeDocument, LikeableType } from './schemas';
import { CreatePostDto, UpdatePostDto, CreateCommentDto, FilterPostDto } from './dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
  ) {}

  /**
   * Crear nuevo post
   */
  async create(userId: string, createDto: CreatePostDto): Promise<PostDocument> {
    const post = new this.postModel({
      userId,
      ...createDto,
    });

    return post.save();
  }

  /**
   * Obtener posts con filtros (feed)
   */
  async findAll(filters: FilterPostDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = { isPublic: true };

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.experienceId) {
      query.experienceId = filters.experienceId;
    }

    if (filters.tag) {
      query.tags = filters.tag;
    }

    const [items, total] = await Promise.all([
      this.postModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.postModel.countDocuments(query).exec(),
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
   * Obtener feed de posts de usuarios seguidos
   */
  async getFeed(userId: string, followingIds: string[], filters: FilterPostDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Incluir posts del usuario y de los usuarios que sigue
    const userIds = [userId, ...followingIds];

    const query: any = {
      userId: { $in: userIds },
      isPublic: true,
    };

    const [items, total] = await Promise.all([
      this.postModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.postModel.countDocuments(query).exec(),
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
   * Obtener post por ID
   */
  async findOne(id: string): Promise<PostDocument> {
    const post = await this.postModel.findById(id).exec();

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    return post;
  }

  /**
   * Actualizar post
   */
  async update(id: string, userId: string, updateDto: UpdatePostDto): Promise<PostDocument> {
    const post = await this.findOne(id);

    if (post.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para actualizar este post');
    }

    Object.assign(post, updateDto);
    return post.save();
  }

  /**
   * Eliminar post
   */
  async remove(id: string, userId: string): Promise<void> {
    const post = await this.findOne(id);

    if (post.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este post');
    }

    // Eliminar comentarios y likes asociados
    await Promise.all([
      this.commentModel.deleteMany({ postId: id }).exec(),
      this.likeModel.deleteMany({ likeableId: id, likeableType: LikeableType.POST }).exec(),
    ]);

    await this.postModel.findByIdAndDelete(id).exec();
  }

  // ========== Comentarios ==========

  /**
   * Agregar comentario a un post
   */
  async addComment(postId: string, userId: string, createDto: CreateCommentDto): Promise<CommentDocument> {
    const post = await this.findOne(postId);

    const comment = new this.commentModel({
      postId,
      userId,
      ...createDto,
    });

    const savedComment = await comment.save();

    // Incrementar contador de comentarios
    post.commentsCount += 1;
    await post.save();

    return savedComment;
  }

  /**
   * Obtener comentarios de un post
   */
  async getComments(postId: string, page = 1, limit = 20) {
    await this.findOne(postId); // Verificar que existe

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.commentModel.find({ postId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.commentModel.countDocuments({ postId }).exec(),
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
   * Eliminar comentario
   */
  async removeComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentModel.findById(commentId).exec();

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este comentario');
    }

    // Decrementar contador de comentarios en el post
    const post = await this.postModel.findById(comment.postId).exec();
    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
      await post.save();
    }

    // Eliminar likes del comentario
    await this.likeModel.deleteMany({ likeableId: commentId, likeableType: LikeableType.COMMENT }).exec();

    await this.commentModel.findByIdAndDelete(commentId).exec();
  }

  // ========== Likes ==========

  /**
   * Dar like a un post o comentario
   */
  async like(userId: string, likeableId: string, likeableType: LikeableType): Promise<LikeDocument> {
    // Verificar que no exista ya
    const existingLike = await this.likeModel
      .findOne({ userId, likeableId, likeableType })
      .exec();

    if (existingLike) {
      return existingLike; // Ya existe, retornar el mismo
    }

    const like = new this.likeModel({
      userId,
      likeableId,
      likeableType,
    });

    const savedLike = await like.save();

    // Incrementar contador
    if (likeableType === LikeableType.POST) {
      const post = await this.postModel.findById(likeableId).exec();
      if (post) {
        post.likesCount += 1;
        await post.save();
      }
    } else if (likeableType === LikeableType.COMMENT) {
      const comment = await this.commentModel.findById(likeableId).exec();
      if (comment) {
        comment.likesCount += 1;
        await comment.save();
      }
    }

    return savedLike;
  }

  /**
   * Quitar like
   */
  async unlike(userId: string, likeableId: string, likeableType: LikeableType): Promise<void> {
    const like = await this.likeModel
      .findOne({ userId, likeableId, likeableType })
      .exec();

    if (!like) {
      throw new NotFoundException('Like no encontrado');
    }

    await this.likeModel.deleteOne({ _id: like._id }).exec();

    // Decrementar contador
    if (likeableType === LikeableType.POST) {
      const post = await this.postModel.findById(likeableId).exec();
      if (post) {
        post.likesCount = Math.max(0, post.likesCount - 1);
        await post.save();
      }
    } else if (likeableType === LikeableType.COMMENT) {
      const comment = await this.commentModel.findById(likeableId).exec();
      if (comment) {
        comment.likesCount = Math.max(0, comment.likesCount - 1);
        await comment.save();
      }
    }
  }

  /**
   * Verificar si el usuario dio like
   */
  async hasLiked(userId: string, likeableId: string, likeableType: LikeableType): Promise<boolean> {
    const like = await this.likeModel
      .findOne({ userId, likeableId, likeableType })
      .exec();

    return !!like;
  }

  /**
   * Obtener usuarios que dieron like
   */
  async getLikes(likeableId: string, likeableType: LikeableType, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.likeModel.find({ likeableId, likeableType }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.likeModel.countDocuments({ likeableId, likeableType }).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
