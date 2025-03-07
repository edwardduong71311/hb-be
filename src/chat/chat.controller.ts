import { Controller, Get, Query, Sse } from '@nestjs/common';
import { ChatService } from './chat.service';
import { interval, map, Observable } from 'rxjs';
import { ChatResponse } from '@/types/chat.type';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @Sse()
  chatWithBot(@Query('text') text: string): Observable<MessageEvent> {
    this.chatService.getAnswer(text);
    return interval(200).pipe(
      map((count) => {
        const res: ChatResponse = { done: false, text: count.toString() };
        const event = new MessageEvent('message', {
          data: JSON.stringify(res),
        });
        return event;
      }),
    );
  }
}
