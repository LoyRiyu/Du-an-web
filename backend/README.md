# Backend Auth Service

## 1) Setup

```bash
cd backend
npm install
cp .env.example .env
```

Cập nhật các biến trong `.env`, đặc biệt:
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

## 2) Tạo bảng PostgreSQL

```bash
psql "$DATABASE_URL" -f sql/init.sql
```

Schema chính:
- `users(id, username unique, password_hash, created_at, updated_at)`

## 3) Chạy service

```bash
npm run dev
```

Mặc định chạy tại `http://localhost:4000`.

## 4) API

- `POST /auth/register` `{ username, password }`
- `POST /auth/login` `{ username, password }`
- `POST /auth/logout`
- `GET /auth/me`

Refresh token được lưu ở cookie `HttpOnly` và access token trả về trong JSON.
