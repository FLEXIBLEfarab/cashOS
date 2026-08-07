/**
 * Стандартный формат API-ответа для всех эндпоинтов «Четки».
 *
 * @template T — тип данных в поле `data`
 */
export interface ApiResponse<T = undefined> {
  /** HTTP статус-код */
  statusCode: number;
  /** Сообщение о результате операции */
  message: string;
  /** Полезные данные ответа */
  data?: T;
  /** Тип ошибки (только при ошибке) */
  error?: string;
}
