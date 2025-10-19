/**
 * Модуль для работы с API
 * Содержит функции для получения и отправки комментариев
 */

// Базовый URL API (используем v2 для ленты комментариев)
const API_BASE_URL = 'https://wedev-api.sky.pro/api';
const API_KEY = 'valeriya-kozik';

// Импорт токена для авторизации из модуля авторизации
import { getToken } from './auth.js';

/**
 * Функция для автоматического повтора запроса при 500-й ошибке
 * @param {Function} fn - функция для выполнения
 * @param {...any} args - аргументы функции
 * @returns {Promise} - промис с результатом
 */
export function retryOnServerError(fn, ...args) {
  return fn(...args).catch((error) => {
    if (error.message === 'Ошибка сервера') {
      console.log('Получена 500-я ошибка, повторяем запрос...');
      return retryOnServerError(fn, ...args);
    }
    throw error;
  });
}

/**
 * Получает список комментариев с сервера
 * @returns {Promise<Array>} - промис с массивом комментариев
 */
export function fetchComments() {
  console.log('Загружаем комментарии с URL:', `${API_BASE_URL}/v2/${API_KEY}/comments`);
  
  return fetch(`${API_BASE_URL}/v2/${API_KEY}/comments`, {
    method: 'GET',
  })
    .then(response => {
      console.log('Ответ сервера:', response.status, response.statusText);
      
      if (!response.ok) {
        // Обрабатываем ошибки сервера (500)
        if (response.status === 500) {
          throw new Error('Ошибка сервера');
        }
        return response.text().then(errorText => {
          console.error('Ошибка сервера:', errorText);
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        });
      }
      
      return response.json();
    })
    .then(data => {
      console.log('Полученные данные:', data);
      return data.comments; // API возвращает { "comments": [...] }
    })
    .catch(error => {
      console.error('Ошибка при загрузке комментариев:', error);
      // Обрабатываем ошибки сети
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Кажется, у вас сломался интернет, попробуйте позже');
      }
      throw error;
    });
}

/**
 * Отправляет новый комментарий на сервер
 * @param {Object} commentData - данные комментария
 * @param {boolean} forceError - принудительно вызвать 500-ю ошибку
 * @returns {Promise<Object>} - промис с результатом
 */
export function postComment(commentData, forceError = false) {
  const requestBody = { ...commentData };
  if (forceError) {
    requestBody.forceError = true;
  }
  
  const token = getToken();
  return fetch(`${API_BASE_URL}/v2/${API_KEY}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(requestBody),
  })
    .then(response => {
      if (!response.ok) {
        // Обрабатываем ошибки валидации (400)
        if (response.status === 400) {
          return response.json().then(errorData => {
            throw new Error(errorData.error || 'Ошибка валидации');
          });
        }
        // Обрабатываем ошибки сервера (500)
        if (response.status === 500) {
          throw new Error('Ошибка сервера');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    })
    .then(data => {
      return data; // API возвращает { "result": "ok" }
    })
    .catch(error => {
      console.error('Ошибка при добавлении комментария:', error);
      // Обрабатываем ошибки сети
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Кажется, у вас сломался интернет, попробуйте позже');
      }
      throw error;
    });
}

/**
 * Авторизация пользователя (логин)
 * @param {{login: string, password: string}} credentials
 * @returns {Promise<{user: {id: string, name: string}, token: string}>}
 */
export function loginUser(credentials) {
  return fetch(`${API_BASE_URL}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 400) {
          return response.json().then((errorData) => {
            throw new Error(errorData.error || 'Неверный логин или пароль');
          });
        }
        if (response.status === 500) {
          throw new Error('Ошибка сервера');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Кажется, у вас сломался интернет, попробуйте позже');
      }
      throw error;
    });
}

/**
 * Регистрация пользователя
 * @param {{login: string, password: string, name: string}} payload
 * @returns {Promise<{user: {id: string, name: string}, token: string}>}
 */
export function registerUser(payload) {
  return fetch(`${API_BASE_URL}/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 400) {
          return response.json().then((errorData) => {
            throw new Error(errorData.error || 'Некорректные данные');
          });
        }
        if (response.status === 500) {
          throw new Error('Ошибка сервера');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Кажется, у вас сломался интернет, попробуйте позже');
      }
      throw error;
    });
}
