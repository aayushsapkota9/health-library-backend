import { ErrorMessage, SuccessMessage } from 'src/interfaces/common.interface';

export const giveSwaggerResponseMessage = (
  message: SuccessMessage | ErrorMessage,
  source?: string | null,
): string => {
  return message.replace('%s', source);
};
