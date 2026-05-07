# SVN Automation Website

Website chính thức SVN Automation Co., Ltd — React + Node.js

## Cấu trúc dự án

```
svn-automation/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/   # Navbar, Footer
│       └── pages/        # Home, Products, Solutions, News, Contact, About
└── server/          # Node.js + Express backend
    └── index.js
```

## Cài đặt & Chạy

### 1. Backend (Node.js server)

```bash
cd server
npm install
node app.js
# Server chạy tại http://localhost:3001
```

### 2. Frontend (React)

```bash
cd client
npm install
npm run dev
# Web chạy tại http://localhost:3000
```

## API Endpoints

| Method | Path           | Mô tả               |
| ------ | -------------- | ------------------- |
| GET    | /api/products  | Danh sách sản phẩm  |
| GET    | /api/solutions | Danh sách giải pháp |
| GET    | /api/partners  | Danh sách đối tác   |
| GET    | /api/news      | Tin tức             |
| POST   | /api/contact   | Gửi form liên hệ    |

## Tính năng

- ✅ Trang chủ với Hero, Sản phẩm, Giải pháp, Đối tác, Tin tức
- ✅ Trang Sản phẩm
- ✅ Trang Giải pháp
- ✅ Trang Tin tức
- ✅ Trang Liên hệ (với form gửi API)
- ✅ Trang Về chúng tôi
- ✅ Navbar responsive + Footer
- ✅ Thiết kế Dark theme — màu xanh lá công nghiệp
- ✅ Font Rajdhani (display) + Nunito Sans (body)
- ✅ Animations, hover effects, smooth scroll
- ✅ Mobile responsive

## Mở rộng thêm

- Kết nối MongoDB để lưu trữ dữ liệu thực
- Thêm trang Admin để quản lý nội dung
- SEO meta tags
- Multilingual (vi/en)
- Deploy lên VPS / Vercel + Railway
