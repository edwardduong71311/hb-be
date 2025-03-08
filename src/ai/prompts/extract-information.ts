import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

import { AIService, ExtractInfo } from '@/types/ai.types';

export default class ExtractInformationPrompt {
  service: AIService;

  constructor(service: AIService) {
    this.service = service;
  }

  run(input: string, summary: string): Promise<ExtractInfo> {
    return new Promise<ExtractInfo>((resolve, reject) => {
      const information = z.object({
        name: z.string(),
        symptoms: z.array(z.string()),
        city: z.string(),
        state: z.string(),
      });

      this.service
        .structure(
          {
            context: `
              You are an expert at structured data extraction.
              From the provided Summary and User Input, get the following data:
              - name: User name.
              - symptoms: is all symptoms that user is having.
              - city: city where user want to book appointment.
              - state: state where user want to book appointment.
            `,
            instruction: 'If does not have information, leave it blank',
            question: input,
            summary: summary,
            temperature: 0.1,
            top_p: 0.1,
          },
          zodResponseFormat(information, 'information_extraction'),
        )
        .then((parsed: ExtractInfo) => {
          parsed.symptoms = parsed.symptoms.filter(
            (item) => item.trim().length > 0,
          );
          resolve(parsed);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
