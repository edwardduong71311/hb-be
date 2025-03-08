import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import OpenAIService from '@/ai/vendors/openai.model';
import { DiseaseRepo } from './repo/disease.repo';
import DefaultDiseaseService from './service/disease.service';

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
            return new OpenAIService(
              configService.get<string>('QUESTION_MODEL')!,
              configService.get<string>('EMBEDDING_MODEL')!,
              configService.get<string>('AI_TOKEN')!,
            );
          },
          inject: [ConfigService],
        },
      ],
      exports: ['AIService'],
    };
  }
}
