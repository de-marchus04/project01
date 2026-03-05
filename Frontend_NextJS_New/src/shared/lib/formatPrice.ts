export const formatPrice = (price: number, lang: 'ru' | 'en' | 'uk'): string => {
  if (lang === 'en') {
    // Assuming 1 USD = 40 UAH for example
    const usdPrice = Math.round(price / 40);
    return `$${usdPrice}`;
  }
  return `${price} ₴`;
};