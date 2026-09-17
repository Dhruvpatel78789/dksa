import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Shashwat Ayurvedam - Live Healthy with Ayurveda",
    template: "%s | Shashwat Ayurvedam",
  },
  description: "Discover authentic Ayurvedic medicines, natural hair care products, skin care routines, and Panchkarma consultation by specialists in Satellite & Naranpura, Ahmedabad.",
  keywords: ["Ayurveda", "Ayurvedic products", "Hair care kit", "Panchkarma Ahmedabad", "Shashwat Ayurvedam", "Ayurvedic consultation"],
  metadataBase: new URL("https://shashwatayurvedam.com"),
  alternates: {
    canonical: "https://shashwatayurvedam.com/",
  },
  openGraph: {
    title: "Shashwat Ayurvedam - Live Healthy with Ayurveda",
    description: "Discover authentic Ayurvedic medicines, hair care products, and Panchkarma consultation.",
    url: "https://shashwatayurvedam.com",
    siteName: "Shashwat Ayurvedam",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Shashwat Ayurvedam",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Shashwat Ayurvedam",
  url: "https://shashwatayurvedam.com",
  logo: "https://shashwatayurvedam.com/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-8487079480",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["en", "hi", "gu"],
  },
  sameAs: [
    "https://shashwatayurvedam.com",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
