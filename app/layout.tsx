import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";

import { ClientQueryProvider } from "@/components/client-query-provider";

export const metadata: Metadata = {
  title: "ToolCity - Make Me Productive",
  description: "Personal finance, expenses, investments, subscriptions, credit cards & vault.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "hsl(263.4, 70%, 50.4%)", // change this value (you can get it from you're css variables, make sure to include 'hsl' and commas)
        },
      }}
    >
      <html lang="en">
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={true}
            disableTransitionOnChange
          >
            <ClientQueryProvider>
              {children}
              <Toaster position="top-right" richColors />
            </ClientQueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
