import type { Metadata } from "next";
import "./globals.css";
import LanguageProvider from "@/components/LanguageProvider";

export const metadata: Metadata = {
  title: "徐铭钰 | Ghibli Portfolio",
  description: "业务分析师 & AI 应用工程师 - 吉卜力风格个人作品集",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased ghibli-bg">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
