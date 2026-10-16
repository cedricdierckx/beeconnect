"use client";

import "./globals.css";
import ErrorScreen from "./components/ErrorScreen";

// Remplace le layout racine quand c'est lui qui plante (fournisseurs, barre de navigation…).
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <ErrorScreen error={error} />
      </body>
    </html>
  );
}
