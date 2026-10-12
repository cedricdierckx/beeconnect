import { NextResponse } from "next/server";
import { APP } from "@/lib/app-config";

/**
 * Digital Asset Links (servi sous /.well-known/assetlinks.json, voir next.config.mjs) :
 * prouve à Android que l'appli Google Play et ce site appartiennent au même éditeur, ce
 * qui permet à la Trusted Web Activity de s'afficher en plein écran sans barre d'adresse.
 * Empreinte(s) SHA-256 du certificat de signature : variable ANDROID_SHA256_CERT_FINGERPRINTS
 * (séparées par des virgules) — Play Console → Intégrité de l'appli → Signature d'application.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const fingerprints = (process.env.ANDROID_SHA256_CERT_FINGERPRINTS ?? "")
    .split(",")
    .map((f) => f.trim().toUpperCase())
    .filter(Boolean);

  const body = fingerprints.length
    ? [
        {
          relation: ["delegate_permission/common.handle_all_urls"],
          target: { namespace: "android_app", package_name: APP.androidPackage, sha256_cert_fingerprints: fingerprints },
        },
      ]
    : [];

  return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=3600" } });
}
