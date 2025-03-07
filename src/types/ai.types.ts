import { EventEmitter } from 'stream';

export enum AIResponseType {
  FUNCTION = 'function',
  DIRECT = 'direct',
  PARSED = 'parsed',
}

export enum AIToolType {
  FUNCTION = 'function',
}

export enum AIPropertyType {
  STRING = 'string',
  NUMBER = 'number',
}

export type AIProperty = {
  type: AIPropertyType;
  description: string;
};

export type AIProperties = {
  [x: string]: AIProperty;
};

export type AIToolData = {
  [x: string]: string | number;
};

export type AITool = {
  type?: AIToolType;
  name: string;
  description: string;
  properties?: AIProperties;
  required?: string[];
};

export type AIMessage = {
  context: string;
  question: string;
  summary?: string;
  instruction?: string;
  example?: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  tools?: AITool[];
};

export type AIResponse = {
  type: AIResponseType;
  tool?: string;
  toolData?: AIToolData;
  content?: string | null;
  parsed?: unknown;
};

export interface AIService {
  // structure: (info: AIMessage, format: unknown) => Promise<AIResponse>;
  query: (info: AIMessage) => Promise<AIResponse>;
  // queryStream: (info: AIMessage) => Promise<EventEmitter>;
}
