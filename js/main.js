/**
 * Главный модуль - точка входа приложения
 * Импортирует модули и запускает проект
 */

import { loadComments, addComment } from './form.js';
import { addLikeHandlers, addReplyHandlers } from './handlers.js';

/**
 * Инициализирует приложение
 */
function init() {
  // Загружаем комментарии при запуске
  loadComments().then(() => {
    // Добавляем обработчики после рендера
    addLikeHandlers();
    addReplyHandlers();
  });
  
  // Добавляем обработчики для формы
  document.querySelector('.add-form-button').addEventListener('click', () => {
    const name = document.querySelector('.add-form-name').value;
    const text = document.querySelector('.add-form-text').value;
    addComment(name, text);
  });
  
  document.querySelector('.add-form-text').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      const name = document.querySelector('.add-form-name').value;
      const text = document.querySelector('.add-form-text').value;
      addComment(name, text);
    }
  });
}

// Запускаем приложение при загрузке DOM
document.addEventListener('DOMContentLoaded', init);
