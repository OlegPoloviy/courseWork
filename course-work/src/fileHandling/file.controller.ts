import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('file')
export class FileController {
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
  }
}
