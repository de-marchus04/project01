export const authApi = {
  getUsers: () => {
    // В рест-API этот метод в идеале должен звать /api/users
    // Но так как у нас сейчас задача убрать ЛС для самого клиента,
    // оставляем заглушку, которую потом перепишем для Админки, если она еще нужна.
    return [];
  },

  register: async (username: string, password: string): Promise<{ username: string; role: string }> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Ошибка при регистрации');
    }

    const data = await res.json();
    return data.user;
  },

  login: async (username: string, password: string): Promise<{ username: string; role: string }> => {
    // Login теперь управляется NextAuth (signIn из next-auth/react)
    // Но если кто-то вызывает это из старого кода напрямую, бросаем ошибку,
    // чтобы переписали на использование signIn.
    console.error("ОШИБКА: Используйте signIn('credentials', ...) из next-auth/react для логина!");
    throw new Error("ОШИБКА: Используйте signIn('credentials', ...) из next-auth/react для логина!");
  },
};
