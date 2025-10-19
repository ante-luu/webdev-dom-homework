/**
 * Модуль для рендеринга комментариев
 * Содержит функции для отображения комментариев на странице
 */

import { comments } from './comments.js';
import { isAuthorized, getUser, clearAuth } from './auth.js';
import { showLoginForm } from './views/login.js';

/**
 * Форматирует дату для отображения
 * @param {string} dateString - строка с датой
 * @returns {string} - отформатированная дата
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU') + ' ' + 
           date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
  } catch (error) {
    return dateString; // Возвращаем исходную строку, если не удалось распарсить
  }
}

/**
 * Получает отображаемое количество лайков
 * @param {Object} comment - объект комментария
 * @returns {number} - количество лайков для отображения
 */
function getDisplayLikes(comment) {
  const baseLikes = comment.likes || 0;
  return comment.isLiked ? baseLikes + 1 : baseLikes;
}

/**
 * Рендерит список комментариев на странице
 */
export function renderComments() {
  const commentsList = document.querySelector('.comments');
  commentsList.innerHTML = '';
  
  comments.forEach((comment, index) => {
    const commentElement = document.createElement('li');
    commentElement.className = 'comment';
    // Храним индекс для обработчика ответа
    commentElement.dataset.index = String(index);
    
    // Определяем класс для иконки лайка на основе булевого значения и состояния загрузки
    let likeButtonClass = comment.isLiked ? 'like-button -active-like' : 'like-button';
    if (comment.isLikeLoading) {
      likeButtonClass += ' -loading-like';
    }
    
    // Форматируем дату для отображения
    const formattedDate = formatDate(comment.date);
    
    commentElement.innerHTML = `
      <div class="comment-header">
        <div>${comment.author?.name || comment.name || 'Аноним'}</div>
        <div>${formattedDate}</div>
      </div>
      <div class="comment-body">
        <div class="comment-text">
          ${comment.text}
        </div>
      </div>
      <div class="comment-footer">
        <div class="likes">
          <span class="likes-counter">${getDisplayLikes(comment)}</span>
          <button class="${likeButtonClass}" data-index="${index}"></button>
        </div>
      </div>
    `;
    
    commentsList.appendChild(commentElement);
  });

  // Рендер панели формы/авторизации под списком
  renderFormOrAuth();
}

/**
 * Показывает состояние загрузки комментариев
 */
export function showCommentsLoading() {
  const commentsList = document.querySelector('.comments');
  commentsList.innerHTML = '<li class="comment"><div class="comment-text">Загрузка комментариев...</div></li>';
}

/**
 * Рендерит форму или ссылку на авторизацию
 */
export function renderFormOrAuth() {
  const container = document.querySelector('.add-form');
  if (!container) return;

  if (!isAuthorized()) {
    container.innerHTML = `
      <div class="auth-hint">
        Чтобы добавить комментарий, <a class="login-link" href="#">авторизуйтесь</a>.
      </div>
    `;
    const loginLink = container.querySelector('.login-link');
    if (loginLink) {
      loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
      });
    }
    return;
  }

  const user = getUser();
  container.innerHTML = `
    <input type="text" class="add-form-name" placeholder="Ваше имя" value="${user?.name || ''}" readonly />
    <textarea type="textarea" class="add-form-text" placeholder="Введите ваш коментарий" rows="4"></textarea>
    <div class="add-form-row">
      <button class="add-form-button">Написать</button>
      <button class="logout-button" style="margin-left: 8px;">Выйти</button>
    </div>
  `;

  const logoutBtn = container.querySelector('.logout-button');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearAuth();
      renderFormOrAuth();
    });
  }
}
