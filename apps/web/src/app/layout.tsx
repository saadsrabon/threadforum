import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
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
  title: "ThreadSphere — Community Forum",
  description:
    "Connect, share, and follow thoughtful communities. Threads, tags, and real-time discussions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full min-h-full antialiased`}
    >
      <body className="flex min-h-full flex-1 flex-col">
        <AuthProvider>
          <NotificationProvider>
            <div className="flex min-h-full flex-1 flex-col">{children}</div>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
