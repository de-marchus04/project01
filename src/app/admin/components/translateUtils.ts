export const translateText = async (text: string, toLang: string): Promise<string> => {
  if (!text || typeof text !== 'string') return text;
  // MyMemory API has a ~500 char limit per request; split long texts by paragraphs
  if (text.length > 450) {
    const paragraphs = text.split('\n');
    const translated: string[] = [];
    let batch = '';
    for (const p of paragraphs) {
      if (batch.length + p.length + 1 > 450 && batch.length > 0) {
        translated.push(await translateText(batch, toLang));
        batch = p;
      } else {
        batch = batch ? batch + '\n' + p : p;
      }
    }
    if (batch) translated.push(await translateText(batch, toLang));
    return translated.join('\n');
  }
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ru|${toLang}`,
    );
    const data = await res.json();
    if (data?.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
  } catch (e) {
    console.error('Translation error:', e);
  }
  return text;
};

const translateArray = async (arr: string[], toLang: string): Promise<string[]> => {
  const results: string[] = [];
  for (const item of arr) {
    results.push(await translateText(item, toLang));
  }
  return results;
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
    'name',
    'text',
    'course',
    'tag',
  ];
  const translations: any = { en: {}, uk: {} };
  let hasText = false;
  for (const field of fieldsToTranslate) {
    if (obj[field]) {
      hasText = true;
      if (Array.isArray(obj[field])) {
        translations.en[field] = await translateArray(obj[field], 'en');
        translations.uk[field] = await translateArray(obj[field], 'uk');
      } else if (typeof obj[field] === 'string') {
        translations.en[field] = await translateText(obj[field], 'en');
        translations.uk[field] = await translateText(obj[field], 'uk');
      }
    }
  }
  return hasText ? { ...obj, translations } : obj;
};
