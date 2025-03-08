import ChainOfThought from '@/ai/pipeline';
import {
  AIService,
  PipelineResponse,
  PipelineResponseType,
} from '@/types/ai.types';
import { ChatResponse, ChatType } from '@/types/chat.type';
import { Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { DynamoChatRepo } from '../repo/chat.repo';
import DiseaseService from './disease.service';

@Injectable()
export class ChatService {
  constructor(
    @Inject('AIService') private aiService: AIService,
    private diseaseService: DiseaseService,
    private chatRepo: DynamoChatRepo,
  ) {}

  async getAnswer(
    conversationId: string,
    text: string,
  ): Promise<Observable<ChatResponse>> {
    this.chatRepo.addMessage({
      id: conversationId,
      datetime: new Date().toISOString(),
      type: ChatType.USER,
      text: text,
      summary: '',
    });

    const data = await this.chatRepo.getSummary(conversationId, ChatType.BOT);
    const summary = data ? data.summary || '' : '';
    console.log('Summary', summary);

    return new Observable<ChatResponse>((subscriber) => {
      if (!conversationId) {
        subscriber.complete();
        return;
      }

      new ChainOfThought(text, summary, this.aiService, this.diseaseService)
        .run()
        .subscribe({
          next: (data: PipelineResponse) => {
            if (data.type === PipelineResponseType.STREAM) {
              subscriber.next({
                text: data.text || '',
              });
            }

            if (data.type === PipelineResponseType.END) {
              this.chatRepo.addMessage({
                id: conversationId,
                datetime: new Date().toISOString(),
                type: ChatType.BOT,
                text: data.text,
                summary: data.summary,
              });
            }
          },
          complete: () => {
            subscriber.complete();
          },
        });
    });
  }

  getConversationId(): string {
    return uuidv4();
  }
}
