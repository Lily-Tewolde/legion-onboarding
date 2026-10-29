import { Inter } from "next/font/google";
import { DemoBanner } from "@/components/DemoBanner";
import { HelpPanel } from "@/components/HelpPanel";
import "./globals.css";

// Inter's optical size axis runs from 14 (Inter) to 32 (Inter Display),
// so one variable font covers body text and headings
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  axes: ["opsz"],
});

// The page shell on every screen: the demo banner, the help link in the
// corner, and one centred column that gives the task the full page
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <DemoBanner />
        <header className="mx-auto flex w-full max-w-task justify-end px-4 pt-2">
          <HelpPanel />
        </header>
        <main className="mx-auto w-full max-w-task flex-1 px-4 pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}
