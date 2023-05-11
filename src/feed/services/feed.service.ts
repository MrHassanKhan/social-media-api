import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedPostEntity } from '../entities/feed.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { User } from '../../auth/models/user.class';
import { FeedPost } from '../dto/feed.interface';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UserService } from 'src/auth/services/user.service';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(FeedPostEntity)
    private readonly feedPostRepository: Repository<FeedPostEntity>,
    private readonly userService: UserService,
  ) {}

  createPost(user: User, feedPost: FeedPost): Observable<FeedPost> {
    feedPost.author = user;
    return from(this.feedPostRepository.save(feedPost));
  }

  findAllPosts(): Observable<FeedPost[]> {
    return from(this.feedPostRepository.find());
  }

  /*
    Get All Posts by the logged in user and all the friend's Posts who's request has been accepted
  */

  findPosts(
    take = 10,
    skip = 0,
    orderBy = 'createdAt',
    user: User,
  ): Observable<FeedPost[]> {
    return this.userService.getFriends(user).pipe(
      switchMap((users: User[]) => {
        return from(
          this.feedPostRepository
            .createQueryBuilder('post')
            .innerJoinAndSelect('post.author', 'author')
            .where('post.author IN (:...authors)', {
              authors: [user.id, ...users.map((u: User) => u.id)],
            })
            .orderBy('post.' + orderBy, 'DESC')
            .take(take)
            .skip(skip)
            .getMany(),
        );
      }),
    );
  }

  updatePost(id: number, feedPost: FeedPost): Observable<UpdateResult> {
    return from(this.feedPostRepository.update(id, feedPost));
  }

  deletePost(id: number): Observable<DeleteResult> {
    return from(this.feedPostRepository.delete(id));
  }

  findPostById(id: number): Observable<FeedPost> {
    return from(
      this.feedPostRepository.findOne({ where: { id }, relations: ['author'] }),
    );
  }
}
