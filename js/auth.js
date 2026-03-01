const AUTH_API_BASE = window.AUTH_API_BASE || 'http://localhost:4000';
const ACCESS_TOKEN_KEY = 'access_token';

let authState = {
  user: null,
  accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
  guestMode: false
};

function qs(id) {
  return document.getElementById(id);
}

function toggleAuthUI(showAuth) {
  const authBox = qs('auth-gate');
  const statusBox = qs('auth-status');
  if (authBox) authBox.style.display = showAuth ? 'block' : 'none';
  if (statusBox) statusBox.style.display = showAuth ? 'none' : 'flex';
}

function setStartEnabled(enabled) {
  const startBtn = qs('start-btn');
  if (!startBtn) return;
  startBtn.disabled = !enabled;
  startBtn.classList.toggle('disabled', !enabled);
}

function renderUser() {
  const userText = qs('auth-user-text');
  if (!userText) return;

  if (authState.user) {
    userText.textContent = `Đang đăng nhập: ${authState.user.username}`;
  } else if (authState.guestMode) {
    userText.textContent = 'Đang ở Guest Mode';
  } else {
    userText.textContent = 'Chưa đăng nhập';
  }

  const canPlay = Boolean(authState.user) || authState.guestMode;
  setStartEnabled(canPlay);
  toggleAuthUI(!canPlay);
}

async function authFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (authState.accessToken) {
    headers.Authorization = `Bearer ${authState.accessToken}`;
  }

  return fetch(`${AUTH_API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });
}

async function submitAuth(path, username, password) {
  const res = await authFetch(path, {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Auth failed');
  }

  authState.user = data.user;
  authState.accessToken = data.accessToken;
  authState.guestMode = false;
  localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  renderUser();
}

async function restoreSession() {
  try {
    const res = await authFetch('/auth/me');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể khôi phục phiên');
    authState.user = data.user;
    authState.accessToken = data.accessToken;
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  } catch {
    authState.user = null;
    authState.accessToken = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  renderUser();
}

async function logout() {
  try {
    await authFetch('/auth/logout', { method: 'POST' });
  } finally {
    authState.user = null;
    authState.accessToken = null;
    authState.guestMode = false;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    renderUser();
  }
}

export function canStartGame() {
  return Boolean(authState.user) || authState.guestMode;
}

export async function initAuth() {
  const registerBtn = qs('register-btn');
  const loginBtn = qs('login-btn');
  const logoutBtn = qs('logout-btn');
  const guestBtn = qs('guest-btn');
  const authError = qs('auth-error');

  const getCreds = () => {
    const username = qs('auth-username')?.value?.trim();
    const password = qs('auth-password')?.value || '';
    if (!username || !password) {
      throw new Error('Vui lòng nhập username/password');
    }
    return { username, password };
  };

  registerBtn?.addEventListener('click', async () => {
    try {
      authError.textContent = '';
      const { username, password } = getCreds();
      await submitAuth('/auth/register', username, password);
    } catch (error) {
      authError.textContent = error.message;
    }
  });

  loginBtn?.addEventListener('click', async () => {
    try {
      authError.textContent = '';
      const { username, password } = getCreds();
      await submitAuth('/auth/login', username, password);
    } catch (error) {
      authError.textContent = error.message;
    }
  });

  logoutBtn?.addEventListener('click', async () => {
    await logout();
  });

  guestBtn?.addEventListener('click', () => {
    authState.guestMode = true;
    authState.user = null;
    renderUser();
  });

  await restoreSession();
}
