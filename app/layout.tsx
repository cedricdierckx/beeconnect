import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";
import { ToastProvider } from "./components/Toaster";
import NavBar from "./components/NavBar";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";
import AuthLinkHandler from "./components/AuthLinkHandler";
import ServiceWorker from "./components/ServiceWorker";

const display = Fredoka({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700"] });
const body = Nunito({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: {
    default: "EarthConnect — le réseau social où les bonnes actions se pollinisent",
    template: "%s · EarthConnect",
  },
  description:
    "Partage tes actions environnementales concrètes, pollinise les bonnes idées et fais-les fleurir ailleurs.",
  applicationName: "EarthConnect",
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: "EarthConnect", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#2F9E5B",
};

// Script en ligne (ne dépend d'aucun fichier) : si une page d'une version précédente réclame un
// fichier /_next/static/ qui n'existe plus après un déploiement, on vide le cache et on recharge
// une seule fois par minute, au lieu d'afficher « Application error ».
const SKEW_RECOVERY = `(function(){var K="ec-recovered-at";addEventListener("error",function(e){var t=e.target,u=t&&(t.src||t.href);if(!u||u.indexOf("/_next/static/")<0)return;try{if(Date.now()-(+sessionStorage.getItem(K)||0)<6e4)return;sessionStorage.setItem(K,String(Date.now()))}catch(_){return}var r=function(){location.reload()};self.caches?caches.keys().then(function(k){return Promise.all(k.map(function(x){return caches.delete(x)}))}).then(r,r):r()},true)})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SKEW_RECOVERY }} />
      </head>
      <body className="min-h-screen">
        <AuthProvider>
          <ToastProvider>
            <AuthLinkHandler />
            <ServiceWorker />
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
