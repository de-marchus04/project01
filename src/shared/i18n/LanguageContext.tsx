"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ru } from './dictionaries/ru';
import { en } from './dictionaries/en';
import { uk } from './dictionaries/uk';
import { mockTranslations } from './mockTranslations';

type Language = 'ru' | 'en' | 'uk';
type Dictionary = typeof ru;

interface LanguageContextType {
  tData: <T extends Record<string, any>>(obj: T) => T;
  tStr: (str: string) => string;
  lang: Language;
  setLang: (lang: Language) => void;
  t: Dictionary;
}

const dictionaries = { ru, en, uk };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>('ru');

  useEffect(() => {
    const savedLang = localStorage.getItem('yoga_lang') as Language;
    if (savedLang && dictionaries[savedLang]) {
      setLangState(savedLang);
    }
  }, []);


  const tStr = (str: string): string => {
    if (!str || lang === "ru") return str;
    let result = str;
    if (mockTranslations[str] && (mockTranslations[str] as any)[lang]) {
      result = (mockTranslations[str] as any)[lang];
    }
    
    if (result.includes('(Админ сайта)')) {
       const translatedAdmin = (mockTranslations['Админ сайта'] as any)?.[lang] || 'Site Admin';
       result = result.replace('(Админ сайта)', `(${translatedAdmin})`);
    }
    
    return result;
  };

  const tData = <T extends Record<string, any>>(obj: T): T => {
    if (!obj || typeof obj !== 'object') return obj;
    
    let newObj: any = { ...obj };
    
    if (lang !== 'ru') {
      const keys = ['title', 'description', 'subtitle', 'content', 'fullDescription', 'location', 'question', 'answer', 'date', 'tag', 'duration', 'category', 'author', 'text', 'name', 'course', 'features'];
      for (const key of keys) {
        const val = newObj[key];
        if (typeof val === 'string') {
          if (mockTranslations[val] && (mockTranslations[val] as any)[lang]) {
            newObj[key] = (mockTranslations[val] as any)[lang];
          } else if (key === 'author' && val.includes('(Админ сайта)')) {
            const translatedAdmin = (mockTranslations['Админ сайта'] as any)?.[lang] || 'Site Admin';
            newObj[key] = val.replace('(Админ сайта)', `(${translatedAdmin})`);
          }
        } else if (Array.isArray(val)) {
          newObj[key] = val.map((item: any) => {
            if (typeof item === 'string' && mockTranslations[item] && (mockTranslations[item] as any)[lang]) {
              return (mockTranslations[item] as any)[lang];
            }
            return item;
          });
        }
      }
    }

    if (obj.translations && obj.translations[lang]) {
      newObj = { ...newObj, ...obj.translations[lang] };
    }
    
    return newObj as T;
  };


  
  const setLang = (newLang: Language) => {
    const overlay = document.createElement('div');
    overlay.className = 'lang-switch-overlay';
    document.body.appendChild(overlay);
    // Swap language at the darkest point (45% of 900ms = ~405ms)
    setTimeout(() => {
      setLangState(newLang);
      localStorage.setItem('yoga_lang', newLang);
    }, 410);
    // Remove overlay after animation ends
    overlay.addEventListener('animationend', () => overlay.remove(), { once: true });
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: dictionaries[lang], tData, tStr }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
