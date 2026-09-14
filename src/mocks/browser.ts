import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Khởi tạo Service Worker với các handlers đã định nghĩa
export const worker = setupWorker(...handlers);
