import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Nav from "@/components/Nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProductBump — Discover tomorrow's favorite products today",
  description:
    "Every product here is ranked by real revenue — not clicks or upvotes. Once a product hits its revenue goal, it makes room for the next one.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Nav />
          {children}
          <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400 mt-16">
            <p>
              ProductBump — revenue verified via{" "}
              <span className="font-semibold text-brand-500">Stripe</span>
            </p>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
