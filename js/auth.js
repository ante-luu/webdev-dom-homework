/**
 * Модуль авторизации: хранение пользователя/токена и работа с LocalStorage
 */

const STORAGE_KEY = 'comments-app-auth';

let currentUser = null;
let currentToken = null;

export function setAuth(user, token) {
  currentUser = user || null;
  currentToken = token || null;
  try {
    if (currentUser && currentToken) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: currentUser, token: currentToken })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (_) {
    // ignore storage errors
  }
}

export function clearAuth() {
  setAuth(null, null);
}

export function getUser() {
  return currentUser;
}

export function getToken() {
  return currentToken;
}

export function isAuthorized() {
  return Boolean(currentUser && currentToken);
}

export function initAuthFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.user && parsed.token) {
      currentUser = parsed.user;
      currentToken = parsed.token;
    }
  } catch (_) {
    // ignore parse errors
  }
}


