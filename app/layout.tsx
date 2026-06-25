import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "animal-island-ui/style";
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
      <body className={`${GeistSans.variable} ${GeistMono.variable} bg-background text-foreground antialiased`}>{children}</body>
    </html>
  );
}
