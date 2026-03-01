import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from './db.js';

const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || '7d';
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || '12');

function parseExpiryToSeconds(expiry) {
  const unit = expiry.slice(-1);
  const value = Number(expiry.slice(0, -1));
  if (Number.isNaN(value)) return 60 * 60 * 24 * 7;
  if (unit === 'm') return value * 60;
  if (unit === 'h') return value * 60 * 60;
  if (unit === 'd') return value * 60 * 60 * 24;
  return value;
}

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES
  });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES
  });
}

export async function createUser(username, password) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await query(
    `INSERT INTO users (username, password_hash)
     VALUES ($1, $2)
     RETURNING id, username, created_at, updated_at`,
    [username, passwordHash]
  );
  return result.rows[0];
}

export async function findUserByUsername(username) {
  const result = await query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0] || null;
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function storeRefreshToken(userId, refreshToken) {
  const tokenHash = await bcrypt.hash(refreshToken, 10);
  const expiresAt = new Date(Date.now() + parseExpiryToSeconds(REFRESH_EXPIRES) * 1000);
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
}

export async function revokeRefreshToken(refreshToken) {
  const tokens = await query('SELECT id, token_hash FROM refresh_tokens');
  for (const row of tokens.rows) {
    const matched = await bcrypt.compare(refreshToken, row.token_hash);
    if (matched) {
      await query('DELETE FROM refresh_tokens WHERE id = $1', [row.id]);
      return true;
    }
  }
  return false;
}

export async function isRefreshTokenValid(refreshToken) {
  const tokens = await query('SELECT id, user_id, token_hash, expires_at FROM refresh_tokens WHERE expires_at > NOW()');
  for (const row of tokens.rows) {
    const matched = await bcrypt.compare(refreshToken, row.token_hash);
    if (matched) {
      return row.user_id;
    }
  }
  return null;
}
