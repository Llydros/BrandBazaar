import type { Metadata } from "next";
import { Oswald, Noto_Sans } from "next/font/google";
import "./globals.css";

import { Providers } from "@/app/providers";
import { Header } from "@/components/layout/header";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrandBazaar",
  description: "A platform for buying and selling designer shoes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${notoSans.variable} ${oswald.variable} font-sans antialiased`}
      >
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
