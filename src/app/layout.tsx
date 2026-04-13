import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { playfairDisplay, montserrat } from "@/lib/fonts";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Tri States Realty | Luxury Homes in DE, MD, NJ & PA",
  description: "Find your dream home across Delaware, Maryland, New Jersey, and Pennsylvania. Luxury real estate with virtual tours, market analytics, and seamless offers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("dark", playfairDisplay.variable, montserrat.variable, "font-sans", geist.variable)}>
      <body className="bg-background text-foreground font-body antialiased">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
