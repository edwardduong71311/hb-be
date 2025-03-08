import { AIResponseEvent, AIService, UserIntention } from '@/types/ai.types';
import { Observable, Subscriber } from 'rxjs';
import RephrasePrompt from './prompts/rephrase';
import GreetingPrompt from './prompts/greeting';
import IntentDetectionPrompt from './prompts/intent-detection';
import RefusePrompt from './prompts/refuse';
import { EventEmitter } from 'events';

export default class ChainOfThought {
  private text: string;
  private rephrasedText: string | null = null;
  private rephrasePrompt: RephrasePrompt;
  private greetingPrompt: GreetingPrompt;
  private intentDetectionPrompt: IntentDetectionPrompt;
  private refusePrompt: RefusePrompt;

  constructor(text: string, aiService: AIService) {
    this.text = text;

    this.rephrasePrompt = new RephrasePrompt(aiService);
    this.greetingPrompt = new GreetingPrompt(aiService);
    this.intentDetectionPrompt = new IntentDetectionPrompt(aiService);
    this.refusePrompt = new RefusePrompt(aiService);
  }

  run(): Observable<string> {
    return new Observable<string>((subscriber) => {
      this.chain(subscriber);
    });
  }

  async chain(subscriber: Subscriber<string>) {
    // Rephrase
    const rephrasedText = await this.rephrasePrompt.run(this.text);

    // Detect intention
    const intent: UserIntention = await this.intentDetectionPrompt.run(
      rephrasedText,
      '',
    );

    console.log(intent);

    switch (intent) {
      case UserIntention.GREETING:
        this.handleStream(subscriber, await this.greetingPrompt.run());
        break;
      case UserIntention.QUERY_SYMPTOM:
        break;
      case UserIntention.QUERY_APPOINTMENT:
        break;
      case UserIntention.PROVIDE_INFORMATION:
        break;

      default:
        this.handleStream(subscriber, await this.refusePrompt.run());
        break;
    }
  }

  handleStream(subscriber: Subscriber<string>, event: EventEmitter) {
    event.on(AIResponseEvent.CONTENT, (chunk: string) => {
      subscriber.next(chunk);
    });
    event.on(AIResponseEvent.END, () => {
      subscriber.complete();
    });
  }
}
