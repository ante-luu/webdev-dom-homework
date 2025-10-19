/**
 * Главный модуль - точка входа приложения
 * Импортирует модули и запускает проект
 */

import { loadComments, addComment } from './form.js';
import { addLikeHandlers, addReplyHandlers } from './handlers.js';
import { initAuthFromStorage, isAuthorized } from './auth.js';
import { renderFormOrAuth } from './render.js';

/**
 * Инициализирует приложение
 */
function init() {
  // Инициализация авторизации из LocalStorage
  initAuthFromStorage();

  // Загружаем комментарии при запуске
  loadComments().then(() => {
    // Добавляем обработчики после рендера
    addLikeHandlers();
    addReplyHandlers();
  });

  // Отрисовываем форму или ссылку на авторизацию
  renderFormOrAuth();

  // Подписываем обработчики формы, когда пользователь авторизован
  const container = document.querySelector('.add-form');
  container.addEventListener('click', (e) => {
    const target = e.target;
    if (!target || !(target instanceof Element)) return;
    if (target.classList.contains('add-form-button')) {
      const name = document.querySelector('.add-form-name')?.value || '';
      const text = document.querySelector('.add-form-text')?.value || '';
      addComment(name, text);
    }
  });

  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey && isAuthorized()) {
      const name = document.querySelector('.add-form-name')?.value || '';
      const text = document.querySelector('.add-form-text')?.value || '';
      addComment(name, text);
    }
  });
}

// Запускаем приложение при загрузке DOM
document.addEventListener('DOMContentLoaded', init);
