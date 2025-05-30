import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  imports: [],
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}
