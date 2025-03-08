import { AIResponse, AIService } from '@/types/ai.types';

export default class RephrasePrompt {
  service: AIService;

  constructor(service: AIService) {
    this.service = service;
  }

  run(input: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.service
        .query({
          context:
            'You are an expert of all languages. Your task is to rephrase the INPUT sentence.',
          instruction: `
            - Remember to rephrase and correct the grammar and fix misspelled words to make it easier to understand.
            - Make it short and do not change the meaning.
            [Important] Do not answer, only rephrase the sentence.`,
          question: input,
          temperature: 0.1,
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
