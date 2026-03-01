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
import { query } from './db.js';

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

function parseOptionalAccess(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    return null;
  }
}

function normalizeLimit(rawLimit, max = 50) {
  const parsed = Number(rawLimit);
  if (Number.isNaN(parsed) || parsed <= 0) return 10;
  return Math.min(parsed, max);
}

function mapScoreRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    difficulty: row.difficulty,
    quality: row.quality,
    morale: row.morale,
    ending: row.ending,
    branch: row.branch,
    createdAt: row.created_at
  };
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

app.post('/scores', async (req, res) => {
  try {
    const payload = parseOptionalAccess(req);
    if (!payload?.sub) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để lưu điểm lên server.' });
    }

    const { difficulty, quality, morale, ending, branch } = req.body || {};
    const allowedDifficulty = new Set(['normal', 'expert', 'asian']);
    if (!allowedDifficulty.has(difficulty)) {
      return res.status(400).json({ message: 'Difficulty không hợp lệ.' });
    }

    if (!Number.isFinite(Number(quality)) || !Number.isFinite(Number(morale)) || !ending) {
      return res.status(400).json({ message: 'Thiếu dữ liệu điểm hợp lệ.' });
    }

    const result = await query(
      `INSERT INTO scores (user_id, difficulty, quality, morale, ending, branch)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, difficulty, quality, morale, ending, branch, created_at`,
      [payload.sub, difficulty, Number(quality), Number(morale), String(ending), branch ? String(branch) : null]
    );

    return res.status(201).json({ score: mapScoreRow(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể lưu điểm.', detail: error.message });
  }
});

app.get('/leaderboard', async (req, res) => {
  try {
    const difficulty = String(req.query.difficulty || 'normal');
    const limit = normalizeLimit(req.query.limit, 100);
    const allowedDifficulty = new Set(['normal', 'expert', 'asian']);
    if (!allowedDifficulty.has(difficulty)) {
      return res.status(400).json({ message: 'Difficulty không hợp lệ.' });
    }

    const result = await query(
      `SELECT s.id, s.user_id, u.username, s.difficulty, s.quality, s.morale, s.ending, s.branch, s.created_at
       FROM scores s
       JOIN users u ON u.id = s.user_id
       WHERE s.difficulty = $1
       ORDER BY s.quality DESC, s.morale DESC, s.created_at ASC
       LIMIT $2`,
      [difficulty, limit]
    );

    return res.json({ difficulty, limit, scores: result.rows.map(mapScoreRow) });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể lấy leaderboard.', detail: error.message });
  }
});

app.get('/leaderboard/all', async (req, res) => {
  try {
    const limit = normalizeLimit(req.query.limit, 100);
    const difficulties = ['normal', 'expert', 'asian'];

    const results = await Promise.all(
      difficulties.map(async (difficulty) => {
        const rows = await query(
          `SELECT s.id, s.user_id, u.username, s.difficulty, s.quality, s.morale, s.ending, s.branch, s.created_at
           FROM scores s
           JOIN users u ON u.id = s.user_id
           WHERE s.difficulty = $1
           ORDER BY s.quality DESC, s.morale DESC, s.created_at ASC
           LIMIT $2`,
          [difficulty, limit]
        );
        return [difficulty, rows.rows.map(mapScoreRow)];
      })
    );

    return res.json({
      limit,
      leaderboards: Object.fromEntries(results)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể lấy leaderboard tổng.', detail: error.message });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Auth service listening on port ${PORT}`);
});
