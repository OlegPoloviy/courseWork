import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { FileModule } from '../fileHandling/file.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    FileModule,
  ],
  controllers: [AiController],
  exports: [AiService],
  providers: [AiService],
})
export class AiModule {}
