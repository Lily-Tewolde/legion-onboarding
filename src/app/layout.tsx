import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DemoBanner } from "@/components/DemoBanner";
import { HelpLink, HelpPanelProvider } from "@/components/HelpPanel";
import { Logo } from "@/components/Logo";
import { NavMotion } from "@/components/NavMotion";
import { copy } from "@/copy";
import "./globals.css";

export const metadata: Metadata = {
  title: copy.shell.tabTitle,
};

// Inter's optical size axis runs from 14 (Inter) to 32 (Inter Display),
// so one variable font covers body text and headings
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  axes: ["opsz"],
});

// The page shell on every screen: the demo banner and the top bar (the logo,
// and the help link opposite it). Each screen lays out the rest with <Screen>
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <HelpPanelProvider>
          <NavMotion />
          <DemoBanner />
          <header className="relative z-20 bg-white md:border-b md:border-[#eef1f6]">
            <div className="mx-auto flex h-11 w-full max-w-form items-center justify-between pr-1.5 pl-4 md:h-16 md:max-w-shell md:px-8">
              <Logo />
              <HelpLink />
            </div>
          </header>
          {children}
        </HelpPanelProvider>
      </body>
    </html>
  );
}
