import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChatController } from '@/controller/chat.controller';
import { ChatService } from '@/service/chat.service';
import { ConfigModule } from '@nestjs/config';
import { OpenAIModule } from '@/ai.module';
import { DynamoChatRepo } from './repo/chat.repo';
import DiseaseService from './service/disease.service';
import { DiseaseRepo } from './repo/disease.repo';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    OpenAIModule.register(),
  ],
  controllers: [ChatController],
  providers: [ChatService, DiseaseService, DiseaseRepo, DynamoChatRepo],
})
export class AppModule {}
