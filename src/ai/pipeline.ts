import { AIService } from '@/types/ai.types';

export default class ChainOfThought {
  text: string;
  aiService: AIService;

  constructor(text: string, aiService: AIService) {
    this.text = text;
    this.aiService = aiService;
  }
}
