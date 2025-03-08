import { Controller, Get, Param, Query, Sse } from '@nestjs/common';
import { ChatService } from '../service/chat.service';
import { map, Observable } from 'rxjs';
import { ChatResponse } from '@/types/chat.type';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':id')
  @Sse()
  async chatWithBot(
    @Param() params: any,
    @Query('text') text: string,
  ): Promise<Observable<MessageEvent>> {
    return (await this.chatService.getAnswer(params.id, text)).pipe(
      map((res: ChatResponse) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify(res),
        });
        return event;
      }),
    );
  }

  @Get()
  getConversation(): string {
    return this.chatService.getConversationId();
  }
}
