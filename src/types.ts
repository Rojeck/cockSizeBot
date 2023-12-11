import { LoggerService } from '@nestjs/common';

export interface ILogger extends LoggerService {
  setContext(context: string): void;
}

export type UserInfo = {
  userTag: string;
  userTgId: string;
  userName: string;
};

export type ChatInfo = {
  chatTgId: string;
  chatType: ChatType;
  chatName: string;
};

export type SizeData = {
  cachedTimeMS: number;
  sizeValue: number;
};

export type TopUserResponse = { userName: string; averageSize: number };

export type ChanceDataValue = {
  cm: number;
  number: number;
};

export enum ChatType {
  PRIVATE = 'private',
  GROUP = 'group',
  SUPER_GROUP = 'supergroup',
  CHANNEL = 'channel',
  BOT = 'bot',
}

export interface IHttpExceptionResponse {
  statusCode: number;
  error: string;
  message: string | Array<string>;
}

export interface ICustomHttpExceptionResponse extends IHttpExceptionResponse {
  path: string;
  method: string;
  timeStamp: Date;
}
