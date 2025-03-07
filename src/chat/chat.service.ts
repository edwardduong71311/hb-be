import { greeting } from '@/ai/prompts/greeting';
import { AIService } from '@/types/ai.types';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  constructor(@Inject('AIService') private aiService: AIService) {}

  async getAnswer(text: string) {
    const res = await greeting(text, this.aiService);
    console.log('Bot response: ' + res.content);

    // this.httpService
    //   .get('http://localhost:9090/symptoms/all', {
    //     headers: {
    //       'x-b3-sampled': '1',
    //       'x-b3-spanid': 'f8985c9e5de18d9f',
    //       'x-b3-traceid': '123123',
    //       Authorization:
    //         'Bearer xxx',
    //     },
    //   })
    //   .subscribe();
    // return {
    //   data: 'Hello World!',
    // };
  }
}
