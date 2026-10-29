import { Inter } from "next/font/google";
import "./globals.css";

// Inter's optical size axis runs from 14 (Inter) to 32 (Inter Display),
// so one variable font covers body text and headings
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  axes: ["opsz"],
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
