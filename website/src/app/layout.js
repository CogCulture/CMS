import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Emaar India- A Blend Of Lifestyle, Commercial Spaces &amp; Residential Projects",
  description: "Emaar India Limited is a well-known real estate developer. They are working on the three pillars commercial spaces, lifestyle, and residential projects",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
         <Header />
        {children}
        <Footer/>
      </body>
    </html>
  );
}
