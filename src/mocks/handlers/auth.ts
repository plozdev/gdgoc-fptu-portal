import { http, HttpResponse, delay } from 'msw';
import { mockUsers } from '../fixtures/users';

// Giả lập HttpOnly Cookie bằng state cục bộ của Service Worker
// Mặc định cho phép login luôn vào tài khoản Chapter Lead để Dev dễ làm việc
let currentSessionUser = mockUsers[0]; 
let isLoggedIn = true; 

export const authHandlers = [
  // Mock POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    await delay(800); // Latency Blindness fix
    
    // Random error 500 để test Error State (xác suất 10%)
    if (Math.random() > 0.9) {
      return HttpResponse.json({ message: 'Internal Server Error (Mock)' }, { status: 500 });
    }

    const body = await request.json() as any;
    const user = mockUsers.find(u => u.email === body.email);

    if (user) {
      isLoggedIn = true;
      currentSessionUser = user;
      return HttpResponse.json({ message: 'Login successful' });
    }

    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  // Mock GET /api/auth/me (Tương đương việc trình duyệt tự đính kèm HttpOnly Cookie)
  http.get('/api/auth/me', async () => {
    await delay(500);

    if (!isLoggedIn) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return HttpResponse.json(currentSessionUser);
  }),

  // Mock POST /api/auth/logout
  http.post('/api/auth/logout', async () => {
    await delay(300);
    isLoggedIn = false;
    return HttpResponse.json({ message: 'Logged out' });
  }),

  // Mock endpoint ĐẶC QUYỀN cho Dev-only User Switcher
  http.post('/api/auth/switch-user', async ({ request }) => {
    const body = await request.json() as { id: string };
    const user = mockUsers.find(u => u.id === body.id);
    if (user) {
      isLoggedIn = true;
      currentSessionUser = user;
      return HttpResponse.json(currentSessionUser);
    }
    return HttpResponse.json({ message: 'User not found' }, { status: 404 });
  })
];
