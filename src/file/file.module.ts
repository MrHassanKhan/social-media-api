import { Module } from '@nestjs/common';
import { FileController } from './controllers/file.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [FileController],
  imports: [AuthModule],
})
export class FileModule {}
