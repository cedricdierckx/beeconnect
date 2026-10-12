import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";
import { ToastProvider } from "./components/Toaster";
import NavBar from "./components/NavBar";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";
import AuthLinkHandler from "./components/AuthLinkHandler";

const display = Fredoka({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700"] });
const body = Nunito({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: {
    default: "EarthConnect — le réseau social où les bonnes actions se pollinisent",
    template: "%s · EarthConnect",
  },
  description:
    "Partage tes actions environnementales concrètes, pollinise les bonnes idées et fais-les fleurir ailleurs.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐝</text></svg>",
  },
};

export const viewport: Viewport = {
  themeColor: "#2F9E5B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen">
        <AuthProvider>
          <ToastProvider>
            <AuthLinkHandler />
            <NavBar />
            <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-4 sm:pb-12">{children}</main>
            <Footer />
            <BottomNav />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
