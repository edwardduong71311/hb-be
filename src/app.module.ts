import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChatController } from '@/chat/chat.controller';
import { ChatService } from '@/chat/chat.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OpenAIModule } from '@/ai.module';

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
  providers: [ChatService],
})
export class AppModule {}
