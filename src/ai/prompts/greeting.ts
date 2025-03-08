import { AIService } from '@/types/ai.types';
import { EventEmitter } from 'events';

export default class GreetPrompt {
  service: AIService;

  constructor(service: AIService) {
    this.service = service;
  }

  run(): Promise<EventEmitter> {
    return new Promise<EventEmitter>((resolve, reject) => {
      this.service
        .queryStream({
          context:
            'You are a friendly Health Care virtual agent. Greet the customer.',
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
