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
  PROVIDE_SYMPTOM = 'PROVIDE_SYMPTOM',
  PROVIDE_PERSONAL_INFO = 'PROVIDE_PERSONAL_INFO',
  QUERY_APPOINTMENT = 'QUERY_APPOINTMENT',
  OTHER = 'OTHER',
}

export enum AIResponseEvent {
  CONTENT = 'content',
  END = 'end',
}

export enum PipelineResponseType {
  STREAM = 'STREAM',
  END = 'END',
}

export type PipelineResponse = {
  type: PipelineResponseType;
  text?: string;
  summary?: string;
};

export type ExtractInfo = {
  name: string;
  symptoms: string[];
  city: string;
  state: string;
};

export enum QueryPatientType {
  NAME = 'NAME',
  CITY = 'CITY',
  STATE = 'STATE',
  SYMPTOM = 'SYMPTOM',
}

export interface AIService {
  structure: (info: AIMessage, format: unknown) => Promise<unknown>;
  query: (info: AIMessage) => Promise<AIResponse>;
  queryWithTool: (info: AIMessage) => Promise<AIToolResponse | null>;
  queryStream: (info: AIMessage) => Promise<EventEmitter>;
  getEmbeddings: (text: string[]) => Promise<number[][]>;
}

export type Disease = {
  id: string;
  name: string;
  symptom: string;
  treatment: string;
};

export type DiseaseResponse = {
  metadatas: Disease[];
  scores: number[];
};
