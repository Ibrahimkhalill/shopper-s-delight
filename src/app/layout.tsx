import type { Metadata } from "next";
import { Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const hind = Hind_Siliguri({
  subsets: ["latin", "bengali"],
  variable: "--font-hind",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Bangladesh's Best Online Shopping Platform",
  description: "Bangladesh's Best Online Shopping Platform",
  authors: [{ name: "Bangladesh's Best Online Shopping Platform" }],
  openGraph: {
    title: "Bangladesh's Best Online Shopping Platform",
    description: "Bangladesh's Best Online Shopping Platform",
    type: "website",
  },
  twitter: {
    card: "summary",
    site: "@Bangladesh's Best Online Shopping Platform",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${hind.variable} ${inter.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
