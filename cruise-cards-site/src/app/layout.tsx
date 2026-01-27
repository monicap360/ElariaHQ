import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cruisesfromgalveston.net"),
  title: "Cruising From Galveston, Clearly Explained",
  description:
    "Independent guidance on ships, itineraries, and planning from people who actually work the port.",
  authors: [{ name: "Cruises From Galveston" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  referrer: "strict-origin-when-cross-origin",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Cruises From Galveston",
    title: "Cruising From Galveston, Clearly Explained",
    description:
      "Independent guidance on ships, itineraries, and planning from people who actually work the port.",
    url: "https://www.cruisesfromgalveston.net/",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Cruise ship at sea",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cruising From Galveston, Clearly Explained",
    description:
      "Independent guidance on ships, itineraries, and planning from people who actually work the port.",
    images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80"],
  },
  icons: {
    icon: "https://img.icons8.com/color/96/000000/cruise-ship.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              name: "Cruises From Galveston",
              url: "https://www.cruisesfromgalveston.net/",
              image:
                "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              telephone: "+14096322106",
              email: "hello@cruisesfromgalveston.net",
              address: {
                "@type": "PostalAddress",
                streetAddress: "123 Harborside Drive",
                addressLocality: "Galveston",
                addressRegion: "TX",
                postalCode: "77550",
                addressCountry: "US",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 29.3013,
                longitude: -94.7977,
              },
              openingHours: "Mo-Fr 09:00-19:00, Sa 10:00-16:00",
              priceRange: "$$-$$$",
              areaServed: [
                { "@type": "AdministrativeArea", name: "Texas" },
                { "@type": "Country", name: "United States" },
              ],
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  contactType: "customer service",
                  email: "hello@cruisesfromgalveston.net",
                  telephone: "+14096322106",
                  availableLanguage: ["English", "Spanish"],
                  areaServed: "US",
                },
                {
                  "@type": "ContactPoint",
                  contactType: "sales",
                  email: "bookings@cruisesfromgalveston.net",
                  telephone: "+14096322106",
                  availableLanguage: ["English", "Spanish"],
                  areaServed: "US",
                },
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "Cruises from Galveston, Texas 2026-2028 | Best Deals & Tips",
              description:
                "Complete guide to booking 2026-2028 cruises from Galveston, Texas. Compare cruise lines, get planning tips, parking guidance, and group options.",
              url: "https://www.cruisesfromgalveston.net/",
              primaryImageOfPage: {
                "@type": "ImageObject",
                url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                width: 1200,
                height: 800,
              },
              publisher: {
                "@type": "Organization",
                name: "Cruises From Galveston",
                url: "https://www.cruisesfromgalveston.net/",
                telephone: "+14096322106",
                email: "hello@cruisesfromgalveston.net",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Cruises From Galveston",
              url: "https://www.cruisesfromgalveston.net/",
              email: "hello@cruisesfromgalveston.net",
              telephone: "+14096322106",
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-background-base text-text-primary">
          <header className="border-b border-white/10 bg-background-panel/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-3 leading-tight">
                <span className="logo-holo" aria-hidden="true">
                  <img src="/brand/cfg-logo.webp" alt="" loading="lazy" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold uppercase tracking-[0.3em] text-text-muted">
                    CruisesFromGalveston.net
                  </span>
                  <span className="text-lg font-semibold text-text-primary">Cruises From Galveston</span>
                </span>
              </Link>
              <nav className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <Link href="/cruises-from-galveston/how-to-plan" className="hover:text-text-primary">
                  Planning Guide
                </Link>
                <Link href="/cruises-from-galveston/board" className="hover:text-text-primary">
                  Cruise Board
                </Link>
                <Link href="/cruises-from-galveston/search" className="hover:text-text-primary">
                  Search
                </Link>
                <Link href="/booking" className="hover:text-text-primary">
                  Book
                </Link>
                <a
                  href="tel:14096322106"
                  className="rounded-full border border-white/10 bg-background-card px-4 py-2 text-xs font-semibold text-text-primary"
                >
                  (409) 632-2106
                </a>
              </nav>
            </div>
          </header>
          {children}
          <footer className="border-t border-white/10 bg-background-panel/80">
            <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-text-muted">
              Cruises From Galveston provides planning guidance and operational support. Pricing and official terms
              remain with cruise lines.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
