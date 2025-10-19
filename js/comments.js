/**
 * Модуль для управления массивом комментариев
 * Содержит массив с данными комментариев и функции для работы с ним
 */

// Массив с данными комментариев (не переназначаем, мутируем)
export const comments = [];

/**
 * Очищает массив комментариев и заполняет новыми данными
 * @param {Array} newComments - новый массив комментариев
 */
export function updateComments(newComments) {
  comments.length = 0;
  comments.push(...newComments);
}

/**
 * Получает комментарий по индексу
 * @param {number} index - индекс комментария
 * @returns {Object|null} - объект комментария или null
 */
export function getComment(index) {
  return comments[index] || null;
}

/**
 * Получает количество комментариев
 * @returns {number} - количество комментариев
 */
export function getCommentsCount() {
  return comments.length;
}
