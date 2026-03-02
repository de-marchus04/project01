import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Header } from "@/widgets/header/ui/Header";
import { Footer } from "@/widgets/footer/ui/Footer";
import { LockoutTimer } from "@/widgets/lockout/ui/LockoutTimer";
import { GlobalModal } from "@/shared/ui/Modal/GlobalModal";
import { SupportWidget } from "@/widgets/support/ui/SupportWidget";
import { LanguageProvider } from "@/shared/i18n/LanguageContext";
import { Providers } from "./providers";

const montserrat = Montserrat({ subsets: ["cyrillic", "latin"], variable: "--font-montserrat" });
const playfair = Playfair_Display({ subsets: ["cyrillic", "latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "YOGA.LIFE | Платформа для йоги",
  description: "Онлайн-платформа для практики йоги с лучшими инструкторами мира.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />
      </head>
      <body className={`${montserrat.variable} ${playfair.variable}`} style={{ backgroundColor: '#f6f7f9' }}>
        <Providers>
          <LanguageProvider>
            <div id="main-content" style={{ transition: 'transform 0.4s ease', minHeight: '100vh', backgroundColor: '#fff', position: 'relative', zIndex: 1, boxShadow: '-5px 0 15px rgba(0,0,0,0.05)' }}>
              <Header />
              <LockoutTimer />
              <GlobalModal />
              <SupportWidget />

              {children}

              <Footer />
            </div>
          </LanguageProvider>
        </Providers>

        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
