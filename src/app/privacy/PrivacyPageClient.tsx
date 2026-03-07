'use client';

import React from 'react';
import { useLanguage } from '@/shared/i18n/LanguageContext';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <main className="flex-grow container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">{t.legal.privacyTitle}</h1>

      <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto prose">
        <p className="mb-6">{t.legal.privacyDesc}</p>

        <h2 className="text-2xl font-bold mb-4">{t.legal.privacyH1}</h2>
        <p className="mb-6">{t.legal.privacyP1}</p>

        <h2 className="text-2xl font-bold mb-4">{t.legal.privacyH2}</h2>
        <p className="mb-6">{t.legal.privacyP2}</p>

        <h2 className="text-2xl font-bold mb-4">{t.legal.privacyH3}</h2>
        <p className="mb-6">{t.legal.privacyP3}</p>

        <div className="mt-12 text-gray-500 text-sm">
          <p>{t.legal.updated}</p>
        </div>
      </div>
    </main>
  );
}
