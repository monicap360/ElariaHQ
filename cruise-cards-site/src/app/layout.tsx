import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cruisesfromgalveston.net"),
  title: "Cruises from Galveston 2026-2028 | Deals, Parking & Terminal Tips",
  description:
    "Compare 2026-2028 cruises from Galveston, TX (Carnival, Royal Caribbean, Norwegian & more). Get terminal tips, parking options, and group cruise help.",
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
    title: "Cruises from Galveston 2026-2028 | Deals, Parking & Terminal Tips",
    description:
      "Compare 2026-2028 cruises from Galveston, TX. Terminal tips, parking options, and group cruise help.",
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
    title: "Cruises from Galveston 2026-2028 | Deals, Parking & Terminal Tips",
    description:
      "Compare 2026-2028 cruises from Galveston, TX. Terminal tips, parking options, and group cruise help.",
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
          rel="preload"
          as="style"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          media="print"
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          />
        </noscript>
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
