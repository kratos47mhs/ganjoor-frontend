import type { Metadata } from "next";
import { Noto_Sans_Arabic, Amiri } from "next/font/google";
import "./globals.css";

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "گنجور - مجموعه اشعار فارسی",
  description: "پلتفرم جامع برای浏览 و مطالعه اشعار فارسی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${notoSansArabic.variable} ${amiri.variable} font-sans antialiased bg-persian-parchment text-persian-ink min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
