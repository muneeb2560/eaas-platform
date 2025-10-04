import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/lib/providers/SupabaseProvider";
import { ToastProvider } from "@/lib/providers/ToastProvider";
import { NotificationProvider } from "@/lib/providers/NotificationProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EaaS - Evaluation as a Service",
  description: "Platform for automated AI model evaluation with custom rubrics and scoring",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans antialiased h-full overflow-x-hidden`}>
        <SupabaseProvider>
          <NotificationProvider>
            <ToastProvider>
              <div className="min-h-screen max-w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-x-hidden">
                {children}
              </div>
            </ToastProvider>
          </NotificationProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
