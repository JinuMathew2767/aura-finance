import "./globals.css";
import { ThemeProvider } from "next-themes";
export const metadata = {
  title: "Aura Finance",
  description: "Household Financial Management PWA",
  appleWebApp: {
    title: "Aura",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-(--background)">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
