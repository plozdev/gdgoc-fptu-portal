# GDGoC FPTU OS - Frontend Portal

Cổng thông tin chính thức và hệ sinh thái số của **Google Developer Groups on Campus - FPT University HCMC (GDGoC FPTU OS)**.

---

## 🛠️ Công Nghệ Sử Dụng

- **Core:** React 18, TypeScript, Vite.
- **Styling:** Tailwind CSS, Lucide Icons, Custom Neo-Brutalist & Modern Flat UI System.
- **State Management:** Zustand (`useAuthStore`, `useMemberStore`, `useInventoryStore`, `useLandingContentStore`, `useNotificationStore`).
- **Networking:** Axios client với HTTP-only cookie session authentication.

---

## 🧭 Cấu Trúc Chức Năng

### 1. Cổng Thông Tin Công Khai (Landing Page)
- **Hero & Official Admission Pass:** Giới thiệu sứ mệnh, số liệu nhiệm kỳ và vé số hóa của chapter.
- **Ban Chuyên Môn (Departments):** 6 ban thuộc 2 khối Tech (AI, Cloud, Web Development, Research) và Community & Events (Media, HR & Event).
- **Hệ Sinh Thái & Sự Kiện:** Danh sách sự kiện, tài nguyên học tập và kết nối cộng đồng.
- **Cộng Đồng Chính Thức:** Nút truy cập trực tiếp Google Developer Groups Community (`gdg.community.dev`).
- **Cổng Tuyển Quân (Recruitment):** Form ứng tuyển nhiều bước được bảo vệ bằng honeypot, validation và chống spam.

### 2. Cổng Thành Viên Nội Bộ (GDGoC FPTU OS)
- **Bảo mật & Đăng nhập:** Đăng nhập bằng MSSV hoặc Email, cơ chế bắt buộc đổi mật khẩu lần đầu, luồng quên/đặt lại mật khẩu gửi qua Gmail SMTP.
- **Dashboard Quản Trị:** Theo dõi KPI, phân quyền thành viên theo vai trò (Member, Lead, BCN).
- **Phân Hệ Nghiệp Vụ:** Quản lý nhân sự (HR), Bảng nhiệm vụ (Task Board), Kho vật tư & Quà tặng (Inventory), Đóng góp & Gems Leaderboard, Quản lý nội dung (Landing CMS).

---

## 📢 Hướng Dẫn Ban Chủ Nhiệm (BCN): Bật / Tắt Đợt Tuyển Quân

Trạng thái mở nhận hồ sơ hoặc hiển thị "Đang Cập Nhật" trên toàn bộ trang chủ được cấu hình tập trung tại:
👉 [`src/data/gdgData.ts`](file:///e:/Developer/Projects/gdgoc-os/FE/src/data/gdgData.ts)

```ts
export const RECRUITMENT_CONFIG = {
  // 👈 CHỈNH SỬA TẠI ĐÂY:
  // - Khi CHƯA MỞ / TẠM ĐÓNG: đặt isOpen = false (Hiển thị "ĐANG CẬP NHẬT")
  // - Khi CHÍNH THỨC MỞ ĐƠN: đặt isOpen = true (Hiển thị "Gia Nhập Gen 4.0 Ngay")
  isOpen: false, 
  batch: "Gen 4.0",
  term: "Kỳ Fall 2026",
  statusBadge: "ĐANG CẬP NHẬT",
  buttonText: "Ứng Tuyển (Đang Cập Nhật)",
  openButtonText: "Gia Nhập Gen 4.0 Ngay",
  ...
};
```

> **Lưu ý đồng bộ Backend:** Khi mở đợt tuyển chính thức, vui lòng cập nhật biến môi trường `RECRUITMENT_OPEN=true` trong file `BE/backend/.env` để backend cho phép lưu hồ sơ vào cơ sở dữ liệu.

---

## 🚀 Khởi Chạy Local Development

```bash
# Cài đặt dependencies
npm ci

# Khởi chạy dev server (mặc định tại http://localhost:3000)
npm run dev

# Kiểm tra kiểu dữ liệu và build production
npm run build
```

---

## 🌐 Cấu Hình Biến Môi Trường (.env)

Xem chi tiết tại `.env.example`:
- `VITE_API_BASE_URL`: Để trống khi dùng chung domain thông qua reverse proxy (Caddy/Nginx) hoặc trỏ tới backend URL (ví dụ: `http://localhost:8080`).
- `VITE_RECRUITMENT_URL`: Đường dẫn phụ trợ tới Google Form dự phòng khi cần thiết.
