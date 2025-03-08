export type ChatResponse = {
  text: string;
};

export enum ChatType {
  USER = 'USER',
  BOT = 'BOT',
}

export type ConversationMessage = {
  id: string;
  datetime: string;
  type: ChatType;
  text?: string;
  summary?: string;
};
