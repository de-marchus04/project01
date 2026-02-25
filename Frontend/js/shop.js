function buyProduct(title, _price) {
    if (typeof window.openBookingModal === 'function') {
        window.openBookingModal('', title, 'general');
        return;
    }

    alert('Форма записи недоступна. Обновите страницу и повторите попытку.');
}

// Global exposure for buttons
window.buyProduct = buyProduct;