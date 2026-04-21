import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beverage ERP",
  description: "ERP para gestión de empresa productora de bebidas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}