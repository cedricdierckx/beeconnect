import type { MetadataRoute } from "next";
import { APP } from "@/lib/app-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: APP.name,
    short_name: APP.shortName,
    description: APP.description,
    lang: "fr",
    dir: "ltr",
    start_url: "/feed",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: APP.backgroundColor,
    theme_color: APP.themeColor,
    categories: ["social", "lifestyle", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Planter une graine", short_name: "Planter", url: "/new", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Tableau d'impact", short_name: "Impact", url: "/impact", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
