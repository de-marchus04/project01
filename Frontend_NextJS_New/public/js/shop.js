// Simulating purchase logic
async function buyProduct(title, price) {
    const userJson = localStorage.getItem('yoga_user');
    if (!userJson) {
        alert('Пожалуйста, войдите в систему для покупки!');
        window.location.href = 'login.html';
        return;
    }
    
    const userData = JSON.parse(userJson);
    // Handle nested user object if present (from login response wrapper)
    const userWrapper = userData.user || userData;
    const username = userWrapper.username;

    if (!username) {
        alert('Ошибка: Не удалось определить пользователя. Пожалуйста, перезайдите.');
        localStorage.removeItem('yoga_user');
        window.location.href = 'login.html';
        return;
    }
    
    if(!confirm(`Вы хотите купить "${title}" за ${price}₽?`)) return;

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username, 
                productTitle: title,
                price: price,
            })
        });

        if (response.ok) {
            alert('Покупка успешна! Продукт доступен в личном кабинете.');
            window.location.href = 'profile.html';
        } else {
            const err = await response.text();
            alert('Ошибка при покупке: ' + err);
        }
    } catch (e) {
        console.error(e);
        alert('Ошибка сети');
    }
}

// Global exposure for buttons
window.buyProduct = buyProduct;
