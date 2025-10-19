/**
 * Модуль для обработчиков событий
 * Содержит функции для добавления обработчиков событий
 */

import { comments } from './comments.js';

/**
 * Функция delay для имитации запроса к API
 * @param {number} interval - интервал задержки в миллисекундах
 * @returns {Promise} - промис с задержкой
 */
function delay(interval = 300) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, interval);
  });
}

/**
 * Добавляет обработчики для кнопок лайков
 */
export function addLikeHandlers() {
  const likeButtons = document.querySelectorAll('.like-button');
  
  likeButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      // Клик по лайку не должен вызывать цитирование
      e.stopPropagation();
      const index = parseInt(button.dataset.index);
      const comment = comments[index];
      
      // Если лайк уже в процессе загрузки, игнорируем клик
      if (comment.isLikeLoading) {
        return;
      }
      
      // Устанавливаем состояние загрузки
      comment.isLikeLoading = true;
      
      // Перерисовываем комментарии для показа анимации
      // Импортируем динамически, чтобы избежать циклических зависимостей
      import('./render.js').then(({ renderComments }) => {
        renderComments();
        
        // Имитируем запрос к API с помощью delay
        delay(2000).then(() => {
          // Обновляем состояние лайка
          comment.likes = comment.isLiked
            ? comment.likes - 1
            : comment.likes + 1;
          comment.isLiked = !comment.isLiked;
          comment.isLikeLoading = false;
          
          // Перерисовываем комментарии
          renderComments();
        });
      });
    });
  });
}

/**
 * Добавляет обработчики для ответа на комментарии (клик по карточке)
 */
export function addReplyHandlers() {
  const commentItems = document.querySelectorAll('.comment');
  const nameInput = document.querySelector('.add-form-name');
  const textInput = document.querySelector('.add-form-text');
  
  commentItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      // Не реагируем, если клик пришёл с лайка
      const target = e.target;
      if (target && target.closest && target.closest('.like-button')) {
        return;
      }
      const idxStr = item.dataset.index || '-1';
      const index = parseInt(idxStr);
      if (Number.isNaN(index) || index < 0 || index >= comments.length) return;
      const original = comments[index];
      const quotedText = `> ${original.text}`;
      textInput.value = `${quotedText}\n${original.name}, `;
      nameInput.focus();
    });
  });
}
