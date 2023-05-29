import { Injectable } from '@nestjs/common';
import languages from './message.constant';

@Injectable()
export class MessageService {
  private readonly languages: Record<string, any> = languages;

  get(key: string): string {
    // Env Variable
    const defaultMessage = process.env.APP_LANGUAGE;
    const keys: string[] = key.split('.');
    let selectedMessage: Record<string, any> | string =
      this.languages[defaultMessage];

    for (const i of keys) {
      selectedMessage = selectedMessage[i];

      if (!selectedMessage) {
        selectedMessage = key;
        break;
      }
    }

    return selectedMessage as string;
  }

  getRequestErrorsMessage(requestErrors: Record<string, any>[]): string {
    const messageErrors: string[] = requestErrors.map((value) => {
      for (const i in value.constraints) {
        return value.property[0];
      }
    });
    return messageErrors[0];
  }
}
