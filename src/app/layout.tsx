import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ObserverProvider from "@/components/ObserverProvider";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";

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
    <ObserverProvider>
      <html lang="fr">
        <body className={`${geistSans.variable} antialiased`}>
          <Header/>
          {children}
          <Footer/>
        </body>
      </html>
    </ObserverProvider>
  );
}
