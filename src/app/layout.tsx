import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Sidebar, Navbar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { ErrorBoundary } from "@/components/shared/error-boundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrustLayer AI - Agent Trust & Identity Platform",
  description: "A trust and identity platform for autonomous AI agents. Evaluate whether an AI agent is authorized, trustworthy, and qualified to perform sensitive actions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col pl-64">
              <Navbar />
              <main className="flex-1 p-4 lg:p-6">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </main>
            </div>
          </div>
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
