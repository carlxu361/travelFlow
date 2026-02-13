import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TravelFlow',
  description: '智能旅行伴侣 - AI 行程规划与行中助手',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
