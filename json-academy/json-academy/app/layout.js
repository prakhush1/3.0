import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/jetbrains-mono/800.css";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata = {
  metadataBase: new URL("https://www.jsonacademy.com"),
  title: {
    default: "JSON Academy — The Complete JSON Toolkit",
    template: "%s | JSON Academy",
  },
  description:
    "Format, validate, minify, convert, and compare JSON — all in one place. Fast, free, and privacy-first. Everything runs right in your browser.",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/icon-192.png",
  },
  openGraph: {
    type: "website",
    siteName: "JSON Academy",
    title: "JSON Academy — The Complete JSON Toolkit",
    description:
      "Format, validate, minify, convert, and compare JSON — all in one place. Fast, free, and privacy-first.",
    url: "https://www.jsonacademy.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Academy — The Complete JSON Toolkit",
    description:
      "Format, validate, minify, convert, and compare JSON — all in one place. Fast, free, and privacy-first.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-mono antialiased" style={{ backgroundColor: "var(--color-bg, #f9fafb)", color: "var(--color-ink, #171717)" }}>
        <GoogleAnalytics />
        <ThemeProvider>
          {children}
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
