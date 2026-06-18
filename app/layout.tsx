import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DSC Action Tracker · DataSkate",
  description: "The DataSkate Sales Support Center action board — track every action, every owner, every deadline across AE Engagement, Client Outreach, and Content workstreams.",
  metadataBase: new URL("https://dsc.dataskate.online"),
  openGraph: {
    title: "DSC Action Tracker · DataSkate",
    description: "The DataSkate Sales Support Center action board — track every action, every owner, every deadline.",
    url: "https://dsc.dataskate.online",
    siteName: "DSC Action Tracker",
    images: [
      {
        url: "https://dsc.dataskate.online/opengraph-image",
        width: 1200,
        height: 630,
        alt: "DSC Action Tracker — DataSkate Sales Support Center",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DSC Action Tracker · DataSkate",
    description: "The DataSkate Sales Support Center action board — track every action, every owner, every deadline.",
    images: ["https://dsc.dataskate.online/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
