import {
  AIMessage,
  AIResponse,
  AIResponseEvent,
  AIService,
  AIToolData,
  AIToolResponse,
} from '@/types/ai.types';
import { EventEmitter } from 'events';
import OpenAI from 'openai';
import { ChatCompletionCreateParamsNonStreaming } from 'openai/resources';
import { Stream } from 'openai/streaming';

export default class OpenAIService implements AIService {
  private client: OpenAI;
  model: string;

  constructor(model: string, token: string) {
    this.model = model;
    this.client = new OpenAI({ apiKey: token });
  }

  formContext = (info: AIMessage) => {
    let context = '';
    if (info.context) {
      context += `\n[Context]: ${info.context}`;
    }
    if (info.summary) {
      context += `\n[Summary]: ${info.summary}`;
    }
    if (info.instruction) {
      context += `\n[Instruction]: ${info.instruction}`;
    }
    if (info.example) {
      context += `\n[Example]: \n${info.example}`;
    }

    console.log('----Context----');
    console.log(context);
    console.log('----Input----');
    console.log(info.question);
    console.log();

    return context;
  };

  getConfig = (info: AIMessage) => {
    return {
      temperature: info.temperature || 1.0,
      top_p: info.top_p || 1.0,
      max_tokens: info.max_tokens || 1000,
      model: this.model,
    };
  };

  query = async (info: AIMessage): Promise<AIResponse> => {
    const response = await this.client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: this.formContext(info),
        },
        { role: 'user', content: info.question || '' },
      ],
      ...this.getConfig(info),
    });

    return {
      content: response.choices[0].message.content,
    };
  };

  queryWithTool = async (info: AIMessage): Promise<AIToolResponse | null> => {
    if (!info.question) return null;

    const options: ChatCompletionCreateParamsNonStreaming = {
      messages: [
        {
          role: 'system',
          content: this.formContext(info),
        },
        { role: 'user', content: info.question },
      ],
      tools: info.tools?.map((tool) => ({
        type: tool.type || 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: {
            type: 'object',
            properties: {
              ...structuredClone(tool.properties),
            },
            required: tool.required || [],
          },
        },
      })),
      ...this.getConfig(info),
    };

    const response = await this.client.chat.completions.create(options);
    const toolCall = response.choices[0].message.tool_calls?.[0];
    if (toolCall && response.choices[0].finish_reason === 'tool_calls') {
      const args = toolCall.function.arguments;
      const data: AIToolData = JSON.parse(args);

      return {
        function: toolCall.function.name,
        data: data,
      };
    }

    return null;
  };

  queryStream = async (info: AIMessage): Promise<EventEmitter> => {
    const stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> =
      await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: this.formContext(info),
          },
          { role: 'user', content: info.question || '' },
        ],
        ...this.getConfig(info),
        stream: true,
        stream_options: { include_usage: true },
      });

    const emitter = new EventEmitter();
    this.processStream(emitter, stream);
    return emitter;
  };

  processStream = async (
    emitter: EventEmitter,
    stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
  ) => {
    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        emitter.emit(AIResponseEvent.CONTENT, chunk.choices[0]?.delta?.content);
      }
    }
    emitter.emit(AIResponseEvent.END);
  };
}
