/**
 * Компонент для рендера формы логина/регистрации
 */

import { loginUser, registerUser } from '../api.js';
import { setAuth } from '../auth.js';
import { renderComments } from '../render.js';

function render(container, mode) {
  container.innerHTML = `
    <div class="login">
      <h3 class="login-title">${mode === 'register' ? 'Регистрация' : 'Вход'}</h3>
      <div class="login-form">
        ${mode === 'register' ? '<input class="login-name" type="text" placeholder="Имя" />' : ''}
        <input class="login-login" type="text" placeholder="Логин" />
        <input class="login-password" type="password" placeholder="Пароль" />
        <div class="add-form-row">
          <button class="login-submit">${mode === 'register' ? 'Зарегистрироваться' : 'Войти'}</button>
          <button class="login-switch" type="button">${mode === 'register' ? 'У меня есть аккаунт' : 'Создать аккаунт'}</button>
        </div>
        <div class="login-error" style="color: #c00; margin-top: 8px;"></div>
      </div>
    </div>
  `;

  const submitBtn = container.querySelector('.login-submit');
  const switchBtn = container.querySelector('.login-switch');
  const errorBox = container.querySelector('.login-error');

  const onSubmit = () => {
    const loginInput = container.querySelector('.login-login');
    const passInput = container.querySelector('.login-password');
    const nameInput = container.querySelector('.login-name');

    const login = loginInput.value.trim();
    const password = passInput.value.trim();
    const name = nameInput ? nameInput.value.trim() : '';

    if (!login || !password || (mode === 'register' && !name)) {
      errorBox.textContent = 'Заполните все поля';
      return;
    }

    submitBtn.disabled = true;
    errorBox.textContent = '';

    const action = mode === 'register'
      ? registerUser({ login, password, name })
      : loginUser({ login, password });

    action
      .then(({ user, token }) => {
        setAuth(user, token);
        renderComments();
      })
      .catch((err) => {
        errorBox.textContent = err.message || 'Ошибка авторизации';
      })
      .finally(() => {
        submitBtn.disabled = false;
      });
  };

  submitBtn.addEventListener('click', onSubmit);
  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') onSubmit();
  });

  switchBtn.addEventListener('click', () => {
    render(container, mode === 'register' ? 'login' : 'register');
  });
}

export function showLoginForm(mode = 'login') {
  const container = document.querySelector('.add-form');
  if (!container) return;
  render(container, mode);
}


