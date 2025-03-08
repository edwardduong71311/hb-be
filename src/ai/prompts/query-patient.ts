import { AIService, QueryPatientType } from '@/types/ai.types';
import { EventEmitter } from 'events';

export default class QueryPatientPrompt {
  service: AIService;

  constructor(service: AIService) {
    this.service = service;
  }

  run(type: QueryPatientType): Promise<EventEmitter> {
    return new Promise<EventEmitter>((resolve, reject) => {
      let query = '';
      if (type === QueryPatientType.NAME) {
        query = 'Ask patient for their name.';
      }
      if (type === QueryPatientType.STATE) {
        query =
          'Ask patient for their preffered state they would like to take a doctor appointment.';
      }
      if (type === QueryPatientType.CITY) {
        query =
          'Ask patient for their preffered city they would like to take a doctor appointment.';
      }
      if (type === QueryPatientType.STATE) {
        query =
          'Ask patient for their preffered state they would like to take a doctor appointment.';
      }
      if (type === QueryPatientType.SYMPTOM) {
        query =
          'Ask customer for their health condition and what kind of symptoms they have.';
      }

      this.service
        .queryStream({
          context: `
            You are a Health Care agent. 
            Your task is to kindly ask customer for more information.
        `,
          instruction: query,
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
