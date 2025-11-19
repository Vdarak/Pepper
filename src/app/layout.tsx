import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChartMaze US - Stock Pattern Scanner",
  description: "AI-powered stock pattern scanner for US markets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
