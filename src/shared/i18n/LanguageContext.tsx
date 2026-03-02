"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ru } from './dictionaries/ru';
import { en } from './dictionaries/en';
import { uk } from './dictionaries/uk';
import { mockTranslations } from './mockTranslations';

type Language = 'ru' | 'en' | 'uk';
type Dictionary = typeof ru;

interface LanguageContextType {
  tData: <T>(obj: T) => T;
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
      const keys = ['title', 'description', 'subtitle', 'content', 'fullDescription', 'location', 'question', 'answer', 'date', 'tag', 'duration', 'category', 'author', 'text', 'name', 'course']; 
      for (const key of keys) {
        if (typeof newObj[key] === 'string') {
          const str = newObj[key];
          if (mockTranslations[str] && (mockTranslations[str] as any)[lang]) {
            newObj[key] = (mockTranslations[str] as any)[lang];
          } else if (key === 'author' && str.includes('(Админ сайта)')) {
            const translatedAdmin = (mockTranslations['Админ сайта'] as any)?.[lang] || 'Site Admin';
            newObj[key] = str.replace('(Админ сайта)', `(${translatedAdmin})`);
          }
        }
      }
    }

    if (obj.translations && obj.translations[lang]) {
      newObj = { ...newObj, ...obj.translations[lang] };
    }
    
    return newObj as T;
  };


  
  const setLang = (newLang: Language) => {
    // Create full-screen overlay to mask language swap
    const overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99999',
      'background:var(--color-bg, #FAF7F2)',
      'opacity:0', 'pointer-events:none',
      'transition:opacity 0.35s ease',
    ].join(';');
    document.body.appendChild(overlay);

    // Fade in overlay
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { overlay.style.opacity = '0.92'; });
    });

    // Swap language at peak opacity, then fade out
    setTimeout(() => {
      setLangState(newLang);
      localStorage.setItem('yoga_lang', newLang);
      overlay.style.opacity = '0';
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }, 380);
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
