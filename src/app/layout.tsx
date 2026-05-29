import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthButton } from "@/components/auth-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "J'ai ton maillot - Retrouve ton flocage",
  description: "Un outil simple pour retrouver ton maillot de foot égaré. Cherche par flocage et reconnecte-toi avec ton maillot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="w-full px-4 py-3 flex justify-end items-center">
          <AuthButton />
        </header>
        {children}
      </body>
    </html>
  );
}
