import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SkillMatch",
  description: "Connect and collaborate with students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-animated-gradient text-slate-100 bg-[#060213]">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
