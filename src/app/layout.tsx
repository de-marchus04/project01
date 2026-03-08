import type { Metadata } from 'next';
import { Montserrat, Playfair_Display } from 'next/font/google';
import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Script from 'next/script';
import { Header } from '@/widgets/header/ui/Header';
import { Footer } from '@/widgets/footer/ui/Footer';
import { LockoutTimer } from '@/widgets/lockout/ui/LockoutTimer';
import { GlobalModal } from '@/shared/ui/Modal/GlobalModal';
import { SupportWidget } from '@/widgets/support/ui/SupportWidget';
import { LanguageProvider } from '@/shared/i18n/LanguageContext';
import { ThemeProvider } from '@/shared/i18n/ThemeContext';
import { Providers } from './providers';
import { WebVitals } from './web-vitals';

const montserrat = Montserrat({ subsets: ['cyrillic', 'latin'], variable: '--font-montserrat' });
const playfair = Playfair_Display({ subsets: ['cyrillic', 'latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'YOGA.LIFE | Платформа для йоги',
  description: 'Онлайн-платформа для практики йоги с лучшими инструкторами мира. Курсы, туры, консультации.',
  openGraph: {
    title: 'YOGA.LIFE | Платформа для йоги',
    description: 'Онлайн-платформа для практики йоги с лучшими инструкторами мира. Курсы, туры, консультации.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yoga-platform-ruby.vercel.app',
    siteName: 'YOGA.LIFE',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'YOGA.LIFE',
      },
    ],
    locale: process.env.NEXT_PUBLIC_OG_LOCALE || 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YOGA.LIFE | Платформа для йоги',
    description: 'Онлайн-платформа для практики йоги с лучшими инструкторами мира.',
    images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop'],
  },
  icons: {
    icon: '/favicon.svg',
  },
  manifest: '/manifest.json',
  other: {
    'theme-color': '#7c3aed',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('yoga_theme')||((window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('yoga_lang');if(l&&['ru','en','uk'].indexOf(l)!==-1)document.documentElement.lang=l;}catch(e){}})();`,
          }}
        />
        <link rel="stylesheet" href="/css/style.css" />
      </head>
      <body className={`${montserrat.variable} ${playfair.variable}`} style={{ backgroundColor: '#f6f7f9' }}>
        <Providers>
          <WebVitals />
          <LanguageProvider>
            <ThemeProvider>
              <a
                href="#main-content"
                className="visually-hidden-focusable position-absolute top-0 start-0 p-3 bg-white text-dark z-3"
              >
                Skip to main content
              </a>
              <div id="main-content">
                <Header />
                <LockoutTimer />
                <GlobalModal />
                <SupportWidget />
                <div aria-live="polite" id="aria-live-region" className="visually-hidden"></div>

                {children}

                <Footer />
              </div>
            </ThemeProvider>
          </LanguageProvider>
        </Providers>

        <Script src="/bootstrap.bundle.min.js" strategy="lazyOnload" />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
