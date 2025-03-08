import { DiseaseResponse } from '@/types/ai.types';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiseaseRepo {
  url: string | undefined;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.url = this.configService.get<string>('SYMPTOM_SERVICE');
  }

  getDiseases(embeddings: number[][]): Promise<DiseaseResponse> {
    return new Promise<DiseaseResponse>((resolve) => {
      this.httpService
        .post(this.url + '/diseases', {
          embeddings: embeddings,
        })
        .subscribe((data) => {
          resolve(data.data);
        });
    });
  }
}
