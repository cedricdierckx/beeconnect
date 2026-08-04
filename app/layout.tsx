import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeeConnect",
  description: "Réseau social axé sur l'écologie et le partage d'expériences.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
