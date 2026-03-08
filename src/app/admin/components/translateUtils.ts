export const translateText = async (text: string, toLang: string): Promise<string> => {
  if (!text || typeof text !== 'string') return text;
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ru|${toLang}`,
    );
    const data = await res.json();
    if (data?.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
  } catch (e) {
    console.error(e);
  }
  return text;
};

export const translateObjectFields = async (obj: any): Promise<any> => {
  const fieldsToTranslate = [
    'title',
    'description',
    'subtitle',
    'content',
    'fullDescription',
    'features',
    'question',
    'answer',
    'location',
  ];
  const translations: any = { en: {}, uk: {} };
  let hasText = false;
  for (const field of fieldsToTranslate) {
    if (obj[field]) {
      hasText = true;
      translations.en[field] = await translateText(obj[field], 'en');
      translations.uk[field] = await translateText(obj[field], 'uk');
    }
  }
  return hasText ? { ...obj, translations } : obj;
};
