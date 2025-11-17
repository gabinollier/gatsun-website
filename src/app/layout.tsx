import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import TailwindIntersectProvider from "@/components/TailwindIntersectProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Gatsun - Studio associatif",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="fr">
        <body className={`${geistSans.variable} antialiased`}>
          <TailwindIntersectProvider>
            {children}
          </TailwindIntersectProvider>
        </body>
      </html>
  );
}
