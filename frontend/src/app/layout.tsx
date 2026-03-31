import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TX Autonomous Trucking Routes",
  description:
    "Interactive database and viewer for autonomous trucking routes in Texas and the Sun Belt",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
