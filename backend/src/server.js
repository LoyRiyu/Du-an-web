import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import {
  createUser,
  findUserByUsername,
  isRefreshTokenValid,
  revokeRefreshToken,
  signAccessToken,
  signRefreshToken,
  storeRefreshToken,
  verifyPassword
} from './authService.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://127.0.0.1:5500';

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

function setRefreshCookie(res, refreshToken) {
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

function authenticateAccess(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Thiếu access token.' });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: 'Access token không hợp lệ hoặc đã hết hạn.' });
  }
}

app.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password || password.length < 6) {
      return res.status(400).json({ message: 'Username và password (>= 6 ký tự) là bắt buộc.' });
    }

    const exists = await findUserByUsername(username);
    if (exists) {
      return res.status(409).json({ message: 'Username đã tồn tại.' });
    }

    const user = await createUser(username, password);
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await storeRefreshToken(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      user: { id: user.id, username: user.username },
      accessToken
    });
  } catch (error) {
    return res.status(500).json({ message: 'Đăng ký thất bại.', detail: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username và password là bắt buộc.' });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Sai thông tin đăng nhập.' });
    }

    const matched = await verifyPassword(password, user.password_hash);
    if (!matched) {
      return res.status(401).json({ message: 'Sai thông tin đăng nhập.' });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await storeRefreshToken(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    return res.json({
      user: { id: user.id, username: user.username },
      accessToken
    });
  } catch (error) {
    return res.status(500).json({ message: 'Đăng nhập thất bại.', detail: error.message });
  }
});

app.post('/auth/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    res.clearCookie('refresh_token');
    return res.json({ message: 'Đăng xuất thành công.' });
  } catch (error) {
    return res.status(500).json({ message: 'Đăng xuất thất bại.', detail: error.message });
  }
});

app.get('/auth/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;

    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice(7);
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      return res.json({ user: { id: payload.sub, username: payload.username }, accessToken: token });
    }

    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Chưa đăng nhập.' });
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const validUserId = await isRefreshTokenValid(refreshToken);
    if (!validUserId || Number(payload.sub) !== Number(validUserId)) {
      return res.status(401).json({ message: 'Refresh token không còn hiệu lực.' });
    }

    const accessToken = signAccessToken({ id: payload.sub, username: payload.username });
    return res.json({
      user: { id: payload.sub, username: payload.username },
      accessToken
    });
  } catch (error) {
    return res.status(401).json({ message: 'Không thể khôi phục phiên.', detail: error.message });
  }
});

app.get('/auth/protected', authenticateAccess, (req, res) => {
  res.json({ message: 'OK', user: req.user });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Auth service listening on port ${PORT}`);
});
