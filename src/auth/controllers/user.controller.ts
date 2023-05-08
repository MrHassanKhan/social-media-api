import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs';
import { User } from '../models/user.class';
import { FileInterceptor } from '@nestjs/platform-express';
import { removeFile, saveImageToStorage } from '../helpers/image-storage';
import { map, of, switchMap } from 'rxjs';
import { join } from 'path';
import { JwtGuard } from '../guards/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get(':userId')
  findUserById(@Param('userId') userStringId: string): Observable<User> {
    const userId = parseInt(userStringId);
    return this.userService.findUserById(userId);
  }

  @UseGuards(JwtGuard)
  @Get('profileimage')
  findImage(@Request() req, @Res() res) {
    const userId = req.user.id;
    return this.userService.findImageNameByUserId(parseInt(userId)).pipe(
      switchMap((imageName: string) => {
        return of(res.sendFile(imageName, { root: './images' }));
      }),
    );
  }

  @UseGuards(JwtGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', saveImageToStorage))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Observable<{ modifiedFileName: string } | { error: string }> {
    const fileName = file?.filename;
    if (!fileName) return of({ error: 'File must be a png, jpg/jpeg' });
    const imagesFolderPath = join(process.cwd(), 'images');
    const fullImagePath = join(imagesFolderPath + '/' + fileName);
    return of(req.user.id).pipe(
      switchMap((userId: number) => {
        if (userId) {
          return this.userService.updateUserImageById(userId, fileName).pipe(
            map(() => ({
              modifiedFileName: fileName,
            })),
          );
        }
        removeFile(fullImagePath);
        return of({ error: 'File content does not match extension!' });
      }),
    );
  }
}
