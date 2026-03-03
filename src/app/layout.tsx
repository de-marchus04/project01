import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Script from "next/script";
import { Header } from "@/widgets/header/ui/Header";
import { Footer } from "@/widgets/footer/ui/Footer";
import { LockoutTimer } from "@/widgets/lockout/ui/LockoutTimer";
import { GlobalModal } from "@/shared/ui/Modal/GlobalModal";
import { SupportWidget } from "@/widgets/support/ui/SupportWidget";
import { LanguageProvider } from "@/shared/i18n/LanguageContext";
import { ThemeProvider } from "@/shared/i18n/ThemeContext";
import { Providers } from "./providers";

const montserrat = Montserrat({ subsets: ["cyrillic", "latin"], variable: "--font-montserrat" });
const playfair = Playfair_Display({ subsets: ["cyrillic", "latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "YOGA.LIFE | Платформа для йоги",
  description: "Онлайн-платформа для практики йоги с лучшими инструкторами мира. Курсы, туры, консультации.",
  openGraph: {
    title: "YOGA.LIFE | Платформа для йоги",
    description: "Онлайн-платформа для практики йоги с лучшими инструкторами мира. Курсы, туры, консультации.",
    url: "https://yoga.life",
    siteName: "YOGA.LIFE",
    images: [
      {
        url: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "YOGA.LIFE",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YOGA.LIFE | Платформа для йоги",
    description: "Онлайн-платформа для практики йоги с лучшими инструкторами мира.",
    images: ["https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200&auto=format&fit=crop"],
  },
  icons: {
    icon: "/favicon.svg",
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
        <link rel="stylesheet" href="/css/style.css" />
      </head>
      <body className={`${montserrat.variable} ${playfair.variable}`} style={{ backgroundColor: '#f6f7f9' }}>
        <Providers>
          <LanguageProvider>
            <ThemeProvider>
            <div id="main-content" style={{ transition: 'transform 0.4s ease', minHeight: '100vh', backgroundColor: 'var(--color-bg)', position: 'relative', zIndex: 1, boxShadow: '-5px 0 15px rgba(0,0,0,0.05)' }}>
              <Header />
              <LockoutTimer />
              <GlobalModal />
              <SupportWidget />

              {children}

              <Footer />
            </div>
          </ThemeProvider>
          </LanguageProvider>
        </Providers>

        <Script src="/bootstrap.bundle.min.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
