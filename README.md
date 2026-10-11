# GDGoC-OS Frontend

React/Vite. Xem ../README.md và ../PRODUCTION_AUDIT.md.

npm ci
npm run dev
npm run build

Build gồm TypeScript check và Vite. Phục vụ dist với SPA fallback và proxy /api tới backend; proxy trong vite.config.ts chỉ dành cho local dev.

.env.example chứa VITE_API_BASE_URL và VITE_RECRUITMENT_URL. Không cần Gemini API key. Không có MSW, người dùng dev hoặc dữ liệu nghiệp vụ mẫu.
