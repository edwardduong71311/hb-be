import EventEmitter from 'events';

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
  question?: string;
  summary?: string;
  instruction?: string;
  example?: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  tools?: AITool[];
};

export type AIResponse = {
  content: string | null;
};

export type AIToolResponse = {
  function: string;
  data: AIToolData;
};

export enum UserIntention {
  GREETING = 'GREETING',
  QUERY_SYMPTOM = 'QUERY_SYMPTOM',
  QUERY_APPOINTMENT = 'QUERY_APPOINTMENT',
  PROVIDE_INFORMATION = 'PROVIDE_INFORMATION',
  OTHER = 'OTHER',
}

export enum AIResponseEvent {
  CONTENT = 'content',
  END = 'end',
}

export interface AIService {
  // structure: (info: AIMessage, format: unknown) => Promise<AIResponse>;
  query: (info: AIMessage) => Promise<AIResponse>;
  queryWithTool: (info: AIMessage) => Promise<AIToolResponse | null>;
  queryStream: (info: AIMessage) => Promise<EventEmitter>;
}
