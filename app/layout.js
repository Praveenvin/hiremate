import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Hiremate",
  description:
    "AI-powered interview agent that conducts interviews, evaluates answers, and generates detailed candidate reports.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Global Notifications */}
        <Toaster />

        {/* Page Content */}
        {children}
      </body>
    </html>
  );
}
