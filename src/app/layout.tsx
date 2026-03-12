import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "创建任意简历网站",
  description: "上传工作区，选择风格，一键生成个人简历网站",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
