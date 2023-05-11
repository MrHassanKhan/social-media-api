import {
  Controller,
  Get,
  UseGuards,
  Request,
  Res,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { UserService } from 'src/auth/services/user.service';
import { Observable, map, of, switchMap } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { removeFile, saveImageToStorage } from '../helpers/image-storage';
import { join } from 'path';

@Controller('file')
export class FileController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('image')
  findImage(@Request() req, @Res() res): Observable<unknown> {
    const userId = req.user.id;

    return this.userService.findImageNameByUserId(userId).pipe(
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

  @UseGuards(JwtGuard)
  @Get('image-name')
  findUserImageName(@Request() req): Observable<{ imageName: string }> {
    const userId = req.user.id;
    return this.userService.findImageNameByUserId(userId).pipe(
      switchMap((imageName: string) => {
        return of({ imageName });
      }),
    );
  }
}
