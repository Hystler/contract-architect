import "server-only";

export async function hasActiveSubscription(_userId?: string | null) {
  // Заглушка для MVP: реальная проверка появится после подключения платежей,
  // авторизации и синхронизации статусов подписки с платежным провайдером.
  return false;
}
