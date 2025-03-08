import { AIService, Disease } from '@/types/ai.types';
import { EventEmitter } from 'events';

export default class ProvideAdvicesPrompt {
  service: AIService;

  constructor(service: AIService) {
    this.service = service;
  }

  run(symtomps: string[], diseases: Disease[]): Promise<EventEmitter> {
    return new Promise<EventEmitter>((resolve, reject) => {
      let knowledges = '';
      diseases.forEach((disease: Disease, index: number) => {
        knowledges += `
        [Possible Disease ${index}]
        Disease: ${disease.name}
        Symptoms: ${disease.symptom}
        Treatments: ${disease.treatment}
      `;
      });

      this.service
        .queryStream({
          context: `
          You are a friendly Health Care agent working for Health Buddy company. 
          Your task is to give customer advices base on their symptoms.
          You must make it meaningful. Each point break into separated line.
          Yout must ask patient to book appointment with you.
        `,
          instruction: `
          [Knowledge Base]:
          ${knowledges}

          - Remember to only answer within [Knowledge Base], do not answer beyond it.
          - Important! Must comfort the customer.
        `,
          question: `I have ${symtomps.reduce(
            (stacked, val) => stacked + ' and ' + val,
          )}`,
        })
        .then((data: EventEmitter) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
