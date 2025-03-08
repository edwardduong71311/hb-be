import {
  AIService,
  AITool,
  AIToolResponse,
  UserIntention,
} from '@/types/ai.types';

export default class IntentDetectionPrompt {
  service: AIService;

  constructor(service: AIService) {
    this.service = service;
  }

  run(input: string, summary: string): Promise<UserIntention> {
    return new Promise<UserIntention>((resolve, reject) => {
      const tools: AITool[] = [
        {
          name: UserIntention.GREETING,
          description: 'Call this function when user greet us',
        },
        {
          name: UserIntention.QUERY_SYMPTOM,
          description:
            'Call this when customer describe their symptoms or health status',
        },
        {
          name: UserIntention.QUERY_APPOINTMENT,
          description:
            'Call this when customer want to book healthcare appointment with us',
        },
        {
          name: UserIntention.PROVIDE_INFORMATION,
          description:
            'Call this when user provide their Name or Preferred City, County or State',
        },
      ];

      this.service
        .queryWithTool({
          context: 'You are an expert in intent detection.',
          instruction:
            'Remember to read Summary and take it to the consideration',
          question: input,
          summary: summary,
          tools,
          temperature: 0.2,
          top_p: 0.1,
        })
        .then((data: AIToolResponse | null) => {
          if (!data) {
            resolve(UserIntention.OTHER);
            return;
          }

          resolve(UserIntention[data.function] || UserIntention.OTHER);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
