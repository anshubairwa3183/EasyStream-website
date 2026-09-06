import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyStream — Your phone on the big screen",
  description: "Download the EasyStream Android companion and Windows receiver alpha.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
