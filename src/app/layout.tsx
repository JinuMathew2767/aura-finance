import "./globals.css";

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
    <html lang="en">
      <body className="antialiased min-h-screen bg-(--background)">
        {children}
      </body>
    </html>
  );
}
