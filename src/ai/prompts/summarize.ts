import { AIResponse, AIService } from '@/types/ai.types';

export default class SummarizePrompt {
  service: AIService;

  constructor(service: AIService) {
    this.service = service;
  }

  run(text: string, summary: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.service
        .query({
          context:
            'You are an Health Care agent who is expert in summerization.',
          instruction: `
          READ [Summary] carefully, remember it by heart.
          The summary must be a list of:
            - [Patient Name]
            - [Patient Preferred Appointment Location]
            - [Patient Symptoms]
            - [BOT Question]
        `,
          summary: summary,
          question: text,
          temperature: 0.2,
          top_p: 0.1,
        })
        .then((data: AIResponse) => {
          resolve(data.content || '');
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
