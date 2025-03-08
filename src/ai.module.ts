import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import OpenAIService from '@/ai/vendors/openai.model';

@Module({})
export class OpenAIModule {
  static register(): DynamicModule {
    return {
      module: OpenAIModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'AIService',
          useFactory: (configService: ConfigService) => {
            const aiToken = configService.get<string>('AI_TOKEN');
            const model = configService.get<string>('QUESTION_MODEL');
            return new OpenAIService(model!, aiToken!);
          },
          inject: [ConfigService],
        },
      ],
      exports: ['AIService'],
    };
  }
}
