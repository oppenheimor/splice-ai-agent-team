import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "animal-island-ui/style";
import "@fontsource/noto-sans-sc/chinese-simplified-400.css";
import "@fontsource/noto-sans-sc/chinese-simplified-500.css";
import "@fontsource/noto-sans-sc/chinese-simplified-600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Splice Agent Team",
  description: "A platform for specialized agent experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${GeistMono.variable} bg-background text-foreground antialiased`}>{children}</body>
    </html>
  );
}
