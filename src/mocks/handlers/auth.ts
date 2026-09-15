/**
 * @file handlers/auth.ts
 * @description MSW (Mock Service Worker) handlers cho Authentication API.
 *
 * ⚠️  DEV ONLY — Tất cả handlers này sẽ bị thay thế khi backend thật được tích hợp.
 *
 * Khi backend sẵn sàng:
 * 1. Xóa file này (hoặc bỏ register trong browser.ts)
 * 2. Tắt MSW worker trong main.tsx
 * 3. App sẽ gọi thẳng tới real API endpoints
 *
 * Mock behavior:
 * - POST /api/auth/login  → Tìm user theo email trong danh sách mock cứng (DEV)
 * - GET  /api/auth/me     → Trả về session hiện tại (giả lập HttpOnly Cookie)
 * - POST /api/auth/logout → Clear session
 * - POST /api/auth/switch-user → Dev-only: switch sang bất kỳ user nào theo ID
 */

import { http, HttpResponse, delay } from 'msw';
import type { UserSession } from '../fixtures/users';

// ==========================================
// DEV SESSION STATE
// Giả lập HttpOnly Cookie bằng module-level state của Service Worker.
// Mặc định: không login (null) — bắt buộc login trước khi vào portal.
// Để dev nhanh hơn, set DEV_AUTO_LOGIN = true và điền devUser bên dưới.
// ==========================================

const DEV_AUTO_LOGIN = false; // ← Đặt true để bypass login screen khi dev

const devSessionState: { user: UserSession | null } = {
  user: DEV_AUTO_LOGIN
    ? null // Khi backend sẵn sàng, bỏ toàn bộ block này
    : null,
};

export const authHandlers = [
  // ------------------------------------------
  // POST /api/auth/login
  // Body: { email: string; password: string }
  // Response: 200 { message } | 401 | 500
  // ------------------------------------------
  http.post('/api/auth/login', async ({ request }) => {
    await delay(800);

    // Simulate random server error (10%) để test Error UI
    if (Math.random() > 0.9) {
      return HttpResponse.json(
        { message: 'Internal Server Error (Mock)' },
        { status: 500 }
      );
    }

    const body = await request.json() as { email?: string; password?: string };
    
    // ⚠️ Mock: Chấp nhận bất kỳ email hợp lệ (không validate password)
    // TODO: Khi có backend → xóa mock này, backend sẽ validate credentials thật
    if (body.email && body.email.includes('@')) {
      // Trả về unauthorized — FE sẽ redirect về login
      // Backend thật sẽ tạo session thật từ đây
      return HttpResponse.json(
        { message: 'Backend not connected. Please integrate real auth.' },
        { status: 401 }
      );
    }

    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  // ------------------------------------------
  // GET /api/auth/me
  // Response: 200 UserSession | 401
  // ------------------------------------------
  http.get('/api/auth/me', async () => {
    await delay(300);

    if (!devSessionState.user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return HttpResponse.json(devSessionState.user);
  }),

  // ------------------------------------------
  // POST /api/auth/logout
  // Response: 200
  // ------------------------------------------
  http.post('/api/auth/logout', async () => {
    await delay(200);
    devSessionState.user = null;
    return HttpResponse.json({ message: 'Logged out' });
  }),

  // ------------------------------------------
  // POST /api/auth/switch-user  [DEV ONLY]
  // Body: { userData: UserSession }
  // Dùng để inject user session thủ công trong DevUserSwitcher
  // ------------------------------------------
  http.post('/api/auth/switch-user', async ({ request }) => {
    const body = await request.json() as { userData?: UserSession };
    if (body.userData) {
      devSessionState.user = body.userData;
      return HttpResponse.json(devSessionState.user);
    }
    return HttpResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }),
];
