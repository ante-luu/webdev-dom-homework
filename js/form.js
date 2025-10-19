/**
 * Модуль для управления формой добавления комментариев
 * Содержит функции для работы с формой и валидации
 */

import { sanitize } from './sanitize.js';
import { retryOnServerError, postComment, fetchComments } from './api.js';
import { updateComments, comments } from './comments.js';
import { renderComments } from './render.js';
import { isAuthorized, getUser } from './auth.js';

// Переменные для сохранения данных формы
let formData = { name: '', text: '' };

/**
 * Показывает состояние загрузки формы
 */
export function showCommentFormLoading() {
  const addForm = document.querySelector('.add-form');
  addForm.innerHTML = '<div class="comment-text">Комментарий добавляется...</div>';
}

/**
 * Скрывает состояние загрузки формы и восстанавливает форму
 */
export function hideCommentFormLoading() {
  const addForm = document.querySelector('.add-form');
  if (!isAuthorized()) {
    addForm.innerHTML = `<div class="auth-hint">Чтобы добавить комментарий, <a class="login-link" href="#">авторизуйтесь</a>.</div>`;
    // Обработчик на случай, если вызывается напрямую вне renderFormOrAuth
    import('./views/login.js').then(({ showLoginForm }) => {
      const link = addForm.querySelector('.login-link');
      if (link) link.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); });
    });
    return;
  }

  const user = getUser();
  addForm.innerHTML = `
    <input
      type="text"
      class="add-form-name"
      placeholder="Введите ваше имя"
      value="${user?.name || formData.name}"
      readonly
    />
    <textarea
      type="textarea"
      class="add-form-text"
      placeholder="Введите ваш коментарий"
      rows="4"
    >${formData.text}</textarea>
    <div class="add-form-row">
      <button class="add-form-button">Написать</button>
    </div>
  `;
  
  // Восстанавливаем обработчики событий
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

/**
 * Добавляет новый комментарий
 * @param {string} name - имя автора
 * @param {string} text - текст комментария
 */
export function addComment(name, text) {
  if (!name.trim() || !text.trim()) {
    alert('Пожалуйста, заполните все поля!');
    return;
  }
  
  // Валидация длины (минимум 3 символа согласно API)
  if (name.trim().length < 3 || text.trim().length < 3) {
    alert('Имя и комментарий должны быть не короче 3 символов');
    return;
  }
  
  // Сохраняем данные формы
  formData.name = name;
  formData.text = text;
  
  // Показываем состояние загрузки формы
  showCommentFormLoading();
  
  // Экранируем HTML, чтобы разметка отображалась как текст
  const safeName = sanitize(name.trim());
  const safeText = sanitize(text.trim());
  
  // Отправляем комментарий на сервер
  const commentData = {
    text: safeText,
    name: safeName
  };
  
  return retryOnServerError(postComment, commentData)
    .then(response => {
      // После успешного добавления перезагружаем комментарии с сервера
      // чтобы получить актуальный список с правильными ID и датами
      return retryOnServerError(loadComments);
    })
    .then(() => {
      // Очищаем сохраненные данные формы после успешного добавления
      formData.name = '';
      formData.text = '';
      // Восстанавливаем форму
      hideCommentFormLoading();
    })
    .catch(error => {
      console.error('Ошибка при добавлении комментария:', error);
      
      // Показываем соответствующие сообщения об ошибках
      if (error.message === 'Кажется, у вас сломался интернет, попробуйте позже') {
        alert('Кажется, у вас сломался интернет, попробуйте позже');
      } else {
        alert(error.message || 'Произошла ошибка при добавлении комментария. Попробуйте еще раз.');
      }
      
      // Восстанавливаем форму с сохраненными данными
      hideCommentFormLoading();
    });
}

/**
 * Загружает комментарии с сервера
 * @returns {Promise} - промис с результатом загрузки
 */
export function loadComments() {
  // Показываем состояние загрузки только при первой загрузке
  if (comments.length === 0) {
    import('./render.js').then(({ showCommentsLoading }) => {
      showCommentsLoading();
    });
  }
  
  return retryOnServerError(fetchComments)
    .then(apiComments => {
      // Обновляем содержимое массива без переназначения ссылки
      updateComments(apiComments);
      
      // Перерисовываем комментарии
      renderComments();
    })
    .catch(error => {
      console.error('Ошибка при загрузке комментариев:', error);
      // Показываем сообщение об ошибке пользователю
      const commentsList = document.querySelector('.comments');
      let errorMessage = 'Ошибка загрузки комментариев. Проверьте подключение к интернету.';
      
      // Показываем соответствующие сообщения об ошибках
      if (error.message === 'Ошибка сервера') {
        errorMessage = 'Сервер сломался, попробуй позже';
      } else if (error.message === 'Кажется, у вас сломался интернет, попробуйте позже') {
        errorMessage = 'Кажется, у вас сломался интернет, попробуйте позже';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'Ошибка CORS. Откройте файл через локальный сервер (например, Live Server в VS Code).';
      } else if (error.message.includes('404')) {
        errorMessage = 'API ключ не найден. Проверьте правильность personal-key.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Не удается подключиться к серверу. Проверьте интернет-соединение.';
      }
      
      commentsList.innerHTML = `<li class="comment"><div class="comment-text">${errorMessage}</div></li>`;
    });
}
