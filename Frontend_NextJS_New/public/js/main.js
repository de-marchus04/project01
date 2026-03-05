const API_URL = 'http://localhost:5253/api';

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------
    // LOGIN PAGE LOGIC
    // ----------------------
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        // If already logged in, redirect
        const { token } = checkAuth();
        if (token) {
            window.location.href = 'admin.html';
            return;
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const errorDiv = document.getElementById('loginError');
            
            errorDiv.textContent = '';
            errorDiv.classList.add('d-none');

            try {
                const response = await fetch(`${API_URL}/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(text || 'Неверные данные для входа');
                }

                const data = await response.json();
                
                // Store session
                localStorage.setItem('yoga_user', JSON.stringify({
                    token: data.token,
                    user: data.user
                }));

                // Redirect
                window.location.href = 'admin.html';

            } catch (err) {
                console.error(err);
                errorDiv.textContent = err.message;
                errorDiv.classList.remove('d-none');
            }
        });
    }

    // ----------------------
    // GLOBAL UTILS
    // ----------------------
    // (Could be expanded later)
});

function checkAuth() {
    const raw = localStorage.getItem('yoga_user');
    if (!raw) return { token: null, user: null };
    try {
        const parsed = JSON.parse(raw);
        return {
            token: parsed.token || null,
            user: parsed.user || null
        };
    } catch {
        return { token: null, user: null };
    }
}
