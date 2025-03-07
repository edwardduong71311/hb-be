import { AIResponse, AIService } from '@/types/ai.types';

export const greeting = (
  text: string,
  service: AIService,
): Promise<AIResponse> => {
  return new Promise<AIResponse>((resolve) => {
    service
      .query({
        context:
          'You are a friendly and warm heart healthcare agent. Your task is to greet customer.',
        question: text,
      })
      .then((data: AIResponse) => {
        resolve(data);
      });
  });
};
