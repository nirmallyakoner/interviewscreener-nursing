import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { MicrosoftClarity } from "@/components/MicrosoftClarity";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NursingPrep - AI-Powered Nursing Interview Practice",
  description: "Master your nursing interviews with AI-powered voice practice. Get instant feedback, performance analysis, and personalized coaching for BSc Nursing interviews.",
  keywords: ["nursing interview", "BSc Nursing", "interview practice", "nursing students", "interview preparation", "AI coaching", "nursing careers"],
  authors: [{ name: "NursingPrep" }],
  
  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nursingprep.vercel.app",
    siteName: "NursingPrep",
    title: "NursingPrep - AI-Powered Nursing Interview Practice",
    description: "Master your nursing interviews with AI-powered voice practice. Get instant feedback, performance analysis, and personalized coaching.",
    images: [
      {
        url: "https://placehold.co/1200x630/4F46E5/FFFFFF/png?text=NursingPrep+-+AI+Interview+Practice",
        width: 1200,
        height: 630,
        alt: "NursingPrep - AI-Powered Nursing Interview Practice Platform",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "NursingPrep - AI-Powered Nursing Interview Practice",
    description: "Master your nursing interviews with AI-powered voice practice. Get instant feedback and personalized coaching.",
    images: ["https://placehold.co/1200x630/4F46E5/FFFFFF/png?text=NursingPrep+-+AI+Interview+Practice"],
  },
  
  // Additional SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification (add your verification codes when ready)
  // verification: {
  //   google: 'your-google-verification-code',
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <GoogleAnalytics />
        <MicrosoftClarity />
      </body>
    </html>
  );
}
