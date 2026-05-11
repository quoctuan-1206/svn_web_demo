# SVN Automation Website

Hướng dẫn chạy dự án.

## Yêu cầu

- Node.js >= 16
- npm
- MongoDB (local hoặc MongoDB Atlas)

## 1. Kết nối Database (MongoDB)

### Cách 1: MongoDB Local

Cài MongoDB Community Server: https://www.mongodb.com/try/download/community

Sau khi cài, mặc định MongoDB chạy tại: `mongodb://localhost:27017`

### Cách 2: MongoDB Atlas (Cloud, miễn phí)

1. Đăng ký tại: https://www.mongodb.com/cloud/atlas
2. Tạo Cluster (Free tier M0)
3. Tạo Database User (username + password)
4. Vào **Network Access** → **Add IP** → `0.0.0.0/0` (cho phép mọi IP)
5. Vào **Connect** → **Drivers** → copy connection string, dạng:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/svn_automation
   ```

### Tạo file `.env` trong thư mục `server/`

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/svn_automation
JWT_SECRET=your_secret_key_here
```

> Nếu dùng Atlas thì thay `MONGODB_URI` bằng connection string ở trên.

### Tạo tài khoản Admin (chạy 1 lần đầu)

```bash
cd server
node scripts/seedAdmin.js
```

Tài khoản mặc định: `admin` / `svn@2025`

## 2. Backend (Node.js server)

```bash
cd server
npm install
node index.js
```

Server chạy tại: `http://localhost:3001`

## 3. Frontend (React)

Mở terminal mới:

```bash
cd client
npm install
npm run dev
```

Web chạy tại: `http://localhost:3000`
