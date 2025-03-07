import {
  AIMessage,
  AIResponse,
  AIResponseType,
  AIService,
  AITool,
  AIToolData,
} from '@/types/ai.types';
import OpenAI from 'openai';
import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionTool,
} from 'openai/resources';

const MODEL = 'gpt-3.5-turbo';

export default class OpenAIService implements AIService {
  private client: OpenAI;

  constructor(token: string) {
    this.client = new OpenAI({ apiKey: token });
  }

  query = async (info: AIMessage): Promise<AIResponse> => {
    let system = '';
    // Generate context
    if (info.context) {
      system += `\n[Context]: ${info.context}`;
    }

    // Generate summary
    if (info.summary) {
      system += `\n[Summary]: ${info.summary}`;
    }

    // Generate instruction
    if (info.instruction) {
      system += `\n[Instruction]: ${info.instruction}`;
    }

    // Generate example
    if (info.example) {
      system += `\n[Example]: \n${info.example}`;
    }

    console.log('----System----');
    console.log(system);
    console.log('----Content----');
    console.log(info.question);
    console.log();

    const options: ChatCompletionCreateParamsNonStreaming = {
      messages: [
        {
          role: 'system',
          content: system,
        },
        { role: 'user', content: info.question },
      ],
      temperature: info.temperature || 1.0,
      top_p: info.top_p || 1.0,
      max_tokens: info.max_tokens || 1000,
      model: MODEL,
    };

    // Generate tools
    const tools: ChatCompletionTool[] = [];
    if (info.tools) {
      info.tools.forEach((tool: AITool) => {
        tools.push({
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
        });
      });
      options.tools = tools;
    }

    const response = await this.client.chat.completions.create(options);

    const toolCall = response.choices[0].message.tool_calls?.[0];
    if (toolCall && response.choices[0].finish_reason === 'tool_calls') {
      const args = toolCall.function.arguments;
      const data: AIToolData = JSON.parse(args);

      return {
        type: AIResponseType.FUNCTION,
        tool: toolCall.function.name,
        toolData: data,
      };
    }

    return {
      type: AIResponseType.DIRECT,
      content: response.choices[0].message.content,
    };
  };
}
