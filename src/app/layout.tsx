import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const display = Space_Grotesk({ variable: "--ff-display", subsets: ["latin"], weight: ["500", "600", "700"] });
const body = Inter({ variable: "--ff-body", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--ff-mono", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://vanorika-inventory-donovanmudarikwa-4254s-projects.vercel.app"),
  title: {
    default: "Vanorika Inventory — Stock control, in seconds",
    template: "%s · Vanorika Inventory",
  },
  description:
    "The easiest way to run your shop's stock. Add products, record stock, and see what's running low — all from your phone.",
  applicationName: "Vanorika Inventory",
  keywords: ["inventory", "stock management", "point of sale", "small business", "Africa", "Vanorika"],
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Vanorika", statusBarStyle: "black-translucent" },
  openGraph: {
    title: "Vanorika Inventory",
    description: "Stock control, in seconds. Built for shops across Africa.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0a09",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
