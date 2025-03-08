import { Injectable } from '@nestjs/common';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

import { ChatType, ConversationMessage } from '@/types/chat.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DynamoChatRepo {
  private client: DynamoDBClient;
  private table: string;

  constructor(private configService: ConfigService) {
    const env = configService.get<string>('ENVIRONMENT');
    this.table = 'conversation';

    let config = {};
    if (env !== 'prod') {
      config = {
        endpoint: 'http://localhost:8000',
        credentials: {
          accessKeyId: 'fakeMyKeyId',
          secretAccessKey: 'fakeSecretAccessKey',
        },
      };
    }

    this.client = new DynamoDBClient({
      region: 'us-east-1',
      ...config,
    });
  }

  async addMessage(item: ConversationMessage): Promise<void> {
    const command = new PutItemCommand({
      TableName: this.table,
      Item: marshall(item),
    });

    await this.client.send(command);
  }

  async getSummary(
    id: string,
    type: ChatType,
  ): Promise<ConversationMessage | undefined> {
    const command = new QueryCommand({
      TableName: this.table,
      KeyConditionExpression: '#id = :id',
      FilterExpression: '#type = :type',
      ExpressionAttributeNames: {
        '#id': 'id',
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':id': id,
        ':type': type.toString(),
      },
      ScanIndexForward: false,
    });

    const response = await this.client.send(command);
    if (response.Items) {
      return response.Items[0] as ConversationMessage;
    }

    return response.Items;
  }
}
