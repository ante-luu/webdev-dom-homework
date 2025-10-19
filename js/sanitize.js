/**
 * Модуль для экранирования HTML-символов
 * Функция преобразования через replaceAll
 */

/**
 * Экранирует HTML-символы в строке
 * @param {string} value - строка для экранирования
 * @returns {string} - экранированная строка
 */
export function sanitize(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
