import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProductBump — Discover tomorrow's favorite products today",
  description:
    "Every product here is ranked by real paying subscribers — not clicks or upvotes. Once a product hits 50 subscribers, it makes room for the next one.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Nav />
        {children}
        <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400 mt-16">
          <p>
            ProductBump — subscriber counts verified via{" "}
            <span className="font-semibold text-brand-500">Stripe Connect</span>
          </p>
        </footer>
      </body>
    </html>
  );
}
