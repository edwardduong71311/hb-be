import ChainOfThought from '@/ai/pipeline';
import { AIService } from '@/types/ai.types';
import { ChatResponse } from '@/types/chat.type';
import { Inject, Injectable } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ChatService {
  constructor(@Inject('AIService') private aiService: AIService) {
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

  getAnswer(text: string): Observable<ChatResponse> {
    return new Observable<ChatResponse>((subscriber) => {
      new ChainOfThought(text, this.aiService).run().subscribe({
        next: (data: string) => {
          subscriber.next({
            text: data,
          });
        },
        complete: () => {
          subscriber.complete();
        },
      });

      return function unsubscribe() {};
    });
  }
}
