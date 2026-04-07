import type { Metadata } from "next";
import { playfairDisplay, montserrat } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tri States Realty | Luxury Homes in DE, MD, NJ & PA",
  description: "Find your dream home across Delaware, Maryland, New Jersey, and Pennsylvania. Luxury real estate with virtual tours, market analytics, and seamless offers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${playfairDisplay.variable} ${montserrat.variable}`}>
      <body className="bg-background text-foreground font-body antialiased">
        {children}
      </body>
    </html>
  );
}
