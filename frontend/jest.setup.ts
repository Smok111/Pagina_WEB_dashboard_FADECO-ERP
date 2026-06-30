import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextDecoder, TextEncoder });
import { MessageChannel } from 'worker_threads';
Object.defineProperty(global, 'MessageChannel', {
  value: MessageChannel,
});
