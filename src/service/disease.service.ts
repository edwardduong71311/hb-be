import { DiseaseRepo } from '@/repo/disease.repo';
import { DiseaseResponse } from '@/types/ai.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class DiseaseService {
  constructor(private diseaseRepo: DiseaseRepo) {}

  async getDiseases(embeddings: number[][]): Promise<DiseaseResponse> {
    return await this.diseaseRepo.getDiseases(embeddings);
  }
}
