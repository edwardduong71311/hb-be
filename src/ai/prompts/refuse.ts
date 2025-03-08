import { AIService } from '@/types/ai.types';
import { EventEmitter } from 'events';

export default class RefusePrompt {
  service: AIService;

  constructor(service: AIService) {
    this.service = service;
  }

  run(): Promise<EventEmitter> {
    return new Promise<EventEmitter>((resolve, reject) => {
      this.service
        .queryStream({
          context:
            'You are a Health Care agent. Your task is to refuse to answer the question.',
        })
        .then((emitter: EventEmitter) => {
          resolve(emitter);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
