import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Tattoo Font Generator",
  description: "Generate tattoo designs with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
