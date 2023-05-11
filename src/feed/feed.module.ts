import { Module } from '@nestjs/common';
import { FeedService } from './services/feed.service';
import { FeedController } from './controllers/feed.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedPostEntity } from './entities/feed.entity';
import { IsCreatorGuard } from './guards/is-creator.guard';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([FeedPostEntity])],
  controllers: [FeedController],
  providers: [FeedService, IsCreatorGuard],
})
export class FeedModule {}
