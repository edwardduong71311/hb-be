import {
  AIResponseEvent,
  AIService,
  ExtractInfo,
  PipelineResponse,
  PipelineResponseType,
  QueryPatientType,
  UserIntention,
} from '@/types/ai.types';
import { Observable, Subscriber } from 'rxjs';
import RephrasePrompt from './prompts/rephrase';
import GreetingPrompt from './prompts/greeting';
import IntentDetectionPrompt from './prompts/intent-detection';
import RefusePrompt from './prompts/refuse';
import { EventEmitter } from 'events';
import ExtractInformationPrompt from './prompts/extract-information';
import DiseaseService from '@/service/disease.service';
import ProvideAdvicesPrompt from './prompts/provide-advices';
import SummarizePrompt from './prompts/summarize';
import QueryPatientPrompt from './prompts/query-patient';

export default class ChainOfThought {
  private text: string;
  private summary: string;
  private rephrasePrompt: RephrasePrompt;
  private greetingPrompt: GreetingPrompt;
  private intentDetectionPrompt: IntentDetectionPrompt;
  private refusePrompt: RefusePrompt;
  private extractInfoPrompt: ExtractInformationPrompt;
  private subscriber: Subscriber<PipelineResponse>;
  private aiService: AIService;
  private diseaseService: DiseaseService;
  private provideAdvicesPrompt: ProvideAdvicesPrompt;
  private summarizePrompt: SummarizePrompt;
  private queryPatientPrompt: QueryPatientPrompt;

  constructor(
    text: string,
    summary: string,
    aiService: AIService,
    diseaseService: DiseaseService,
  ) {
    this.aiService = aiService;
    this.diseaseService = diseaseService;
    this.text = text;
    this.summary = summary;

    this.rephrasePrompt = new RephrasePrompt(aiService);
    this.greetingPrompt = new GreetingPrompt(aiService);
    this.intentDetectionPrompt = new IntentDetectionPrompt(aiService);
    this.extractInfoPrompt = new ExtractInformationPrompt(aiService);
    this.refusePrompt = new RefusePrompt(aiService);
    this.provideAdvicesPrompt = new ProvideAdvicesPrompt(aiService);
    this.summarizePrompt = new SummarizePrompt(aiService);
    this.queryPatientPrompt = new QueryPatientPrompt(aiService);
  }

  run(): Observable<PipelineResponse> {
    return new Observable<PipelineResponse>((subscriber) => {
      this.subscriber = subscriber;
      this.chain();
    });
  }

  async chain() {
    // Rephrase
    const rephrasedText = await this.rephrasePrompt.run(this.text);

    // Detect patient's intention
    const intent: UserIntention = await this.intentDetectionPrompt.run(
      rephrasedText,
      this.summary,
    );

    console.log('Customer Intention', intent);
    switch (intent) {
      case UserIntention.GREETING:
        this.greeting();
        break;
      case UserIntention.PROVIDE_SYMPTOM:
        this.provideAdvices(rephrasedText);
        break;
      case UserIntention.PROVIDE_PERSONAL_INFO:
        this.provideInformation();
        break;
      case UserIntention.QUERY_APPOINTMENT:
        this.bookAppointment();
        break;

      default:
        this.refuseToAnswer();
        break;
    }
  }

  async provideInformation() {
    this.summary = await this.summarizePrompt.run(
      `Patient say: ${this.text}`,
      this.summary,
    );

    this.bookAppointment();
  }

  async askPatient(info: ExtractInfo): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      console.log(info);
      let type: any = null;
      if (!info.name || info.name.trim().length === 0) {
        type = QueryPatientType.NAME;
      } else if (!info.city || info.city.trim().length === 0) {
        type = QueryPatientType.CITY;
      } else if (!info.state || info.state.trim().length === 0) {
        type = QueryPatientType.STATE;
      } else if (!info.symptoms || info.symptoms.length === 0) {
        type = QueryPatientType.SYMPTOM;
      }

      if (!type) {
        resolve(false);
        return;
      }

      const botAnswered = await this.handleStream(
        await this.queryPatientPrompt.run(type),
      );

      this.summary = await this.summarizePrompt.run(
        `Bot say: ${botAnswered}`,
        this.summary,
      );

      this.subscriber.next({
        type: PipelineResponseType.END,
        text: botAnswered,
        summary: this.summary,
      } as PipelineResponse);
      this.subscriber.complete();
    });
  }

  async bookAppointment() {
    const info: ExtractInfo = await this.extractInfoPrompt.run(
      this.text,
      this.summary,
    );

    if (await this.askPatient(info)) {
      return;
    }

    // Get Specialists
    console.log('Get specialties');
  }

  async provideAdvices(rephrasedText: string) {
    const info: ExtractInfo = await this.extractInfoPrompt.run(
      rephrasedText,
      this.summary,
    );

    if (!info || !info.symptoms || info.symptoms.length === 0) {
      this.refuseToAnswer();
      return;
    }

    const embeddings = await this.aiService.getEmbeddings(info.symptoms);
    const res = await this.diseaseService.getDiseases(embeddings);
    if (!res || !res.metadatas) {
      this.refuseToAnswer();
      return;
    }

    // For now, Only give Advice base on first 3 diseases
    const diseases = res.metadatas.slice(0, 3);
    const botAnswer = await this.handleStream(
      await this.provideAdvicesPrompt.run(info.symptoms, diseases),
    );

    // Summarize
    this.summary = await this.summarizePrompt.run(
      `Customer say ${rephrasedText}
      Bot say ${botAnswer}`,
      this.summary,
    );

    this.subscriber.next({
      type: PipelineResponseType.END,
      text: botAnswer,
      summary: this.summary,
    } as PipelineResponse);
    this.subscriber.complete();
  }

  async greeting() {
    this.handleStream(await this.greetingPrompt.run()).then((text) => {
      this.subscriber.next({
        type: PipelineResponseType.END,
        text: text,
        summary: this.summary,
      } as PipelineResponse);
      this.subscriber.complete();
    });
  }

  async refuseToAnswer() {
    this.handleStream(await this.refusePrompt.run()).then((text) => {
      this.subscriber.next({
        type: PipelineResponseType.END,
        text: text,
        summary: this.summary,
      } as PipelineResponse);
      this.subscriber.complete();
    });
  }

  handleStream(event: EventEmitter): Promise<string> {
    return new Promise<string>((resolve) => {
      let answer = '';
      event.on(AIResponseEvent.CONTENT, (chunk: string) => {
        this.subscriber.next({
          type: PipelineResponseType.STREAM,
          text: chunk,
        } as PipelineResponse);
        answer += chunk;
      });

      event.on(AIResponseEvent.END, () => {
        resolve(answer);
      });
    });
  }
}
