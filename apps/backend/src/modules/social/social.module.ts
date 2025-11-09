import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { FollowsService } from './follows.service';
import { PostsController } from './posts.controller';
import { FollowsController } from './follows.controller';
import { Post, PostSchema, Comment, CommentSchema, Like, LikeSchema, Follow, FollowSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Follow.name, schema: FollowSchema },
    ]),
  ],
  controllers: [PostsController, FollowsController],
  providers: [PostsService, FollowsService],
  exports: [PostsService, FollowsService],
})
export class SocialModule {}
