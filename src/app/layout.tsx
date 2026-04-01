import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Aura Finance",
  description: "Household Financial Management PWA",
  manifest: "/manifest.webmanifest",
  applicationName: "Aura Finance",
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/apple-icon",
  },
  appleWebApp: {
    capable: true,
    title: "Aura",
    statusBarStyle: "black-translucent",
    startupImage: [],
  },
};

export const viewport: Viewport = {
  themeColor: "#6d5efc",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-(--background)">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
