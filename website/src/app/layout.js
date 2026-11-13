import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/footer";
import MobileDock from "@/components/MobileDock";
import { EnquiryProvider } from "@/components/EnquiryModal";
import VisualEditor from "@/components/VisualEditor";
import LiveReloadListener from "@/components/LiveReloadListener";
import { getPage } from "@/services/pageService";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-source-sans",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.emaarindia.com";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Emaar India", template: "%s | Emaar India" },
  description:
    "Emaar India is a leading real estate developer with residential, commercial and lifestyle projects.",
  openGraph: { type: "website", siteName: "Emaar India", locale: "en_IN" },
  robots: { index: true, follow: true },
};

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({ children }) {
  const [header, footer] = await Promise.all([
    getPage("header", { revalidate: 300 }),
    getPage("footer", { revalidate: 300 }),
  ]);
  if (!header || !footer) throw new Error("Header/footer data missing from API");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Emaar India",
    url: SITE_URL,
    logo: `${SITE_URL}${header.logo?.src || '/images/emaar-india-logo-en.svg'}`,
    sameAs: Array.isArray(footer.social) ? footer.social.map((s) => s.href) : [],
  };

  return (
    <html lang="en" className={sourceSans.variable}>
      <head>
        <link rel="stylesheet" href="/maplibre-gl.css" />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <EnquiryProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-black"
          >
            Skip to content
          </a>
          <Header data={header} />
          {children}
          <Footer data={footer} />
          <MobileDock header={header} footer={footer} />
          <VisualEditor />
          <LiveReloadListener />
        </EnquiryProvider>
      </body>
    </html>
  );
}