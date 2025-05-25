import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Provider from "@/context/SessionProvider";
import { Provider as ChakraProvider } from "@/components/ui/provider";
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
  title: "Searching engine",
  description: "Search anything related to the military",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>
          <ChakraProvider>{children}</ChakraProvider>
        </Provider>
      </body>
    </html>
  );
}
