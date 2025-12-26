"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Shield, FileCheck, Fingerprint, Package, CheckCircle2, ArrowLeft } from "lucide-react";
import { useProduct } from "@/hooks/use-product";
import { Button } from "@/components/ui/button";

const verificationSteps = [
  {
    title: "1. Intake & metadata pairing",
    description: "High-resolution imagery, NFC tap data, and seller manifest are captured and paired with the product ID.",
    metrics: ["12MP macro imagery", "Temperature controlled intake", "Chain-of-custody token"],
  },
  {
    title: "2. Physical + material inspection",
    description: "Technicians compare stitching density, material weight, and component tolerances with brand reference libraries.",
    metrics: ["±0.2mm stitching tolerance", "Material spectrum fingerprint", "Component weight delta < 2g"],
  },
  {
    title: "3. Digital signature & COA issue",
    description: "Once the audit passes, a cryptographically signed COA is minted and linked to the product QR / NFC tag.",
    metrics: ["EIP-712 signature", "SHA-256 image hash", "COA refresh every 12 months"],
  },
];

const coaChecklist = [
  {
    label: "QR / NFC tag",
    detail: "Matches the encoded Product ID and includes tamper log.",
  },
  {
    label: "Serial alignment",
    detail: "Serial block matches manufacturer database export from the last 24h.",
  },
  {
    label: "Packaging audit",
    detail: "Inner label fonts, glue patterns, and warranty card UV marks verified.",
  },
  {
    label: "Third-party stamp",
    detail: "Signed by LegitLabs™ Level 2 inspector with dual review.",
  },
];

const provider = {
  name: "LegitLabs™",
  responseTime: "Under 24h turnaround",
  coverage: "Sneakers, streetwear, collectibles",
  contact: "support@legitlabs.io",
  hotline: "+1 (415) 555-0112",
};

export default function LegitCheckPage() {
  const params = useParams();
  const productId = params.id as string;
  const { data: product, isLoading, error } = useProduct(productId);

  const focusAreaByCategory: Record<string, string> = {
    sneakers: "Midsole tooling, heel counter structure, outsole traction pattern",
    apparel: "Fabric GSM, seam density, heat-transfer labels",
    accessories: "Hardware engraving depth, plating consistency, lining stitch",
  };

  const categoryKey = product?.category?.toLowerCase() || "default";
  const focusArea =
    focusAreaByCategory[categoryKey] ||
    "Material composition, packaging audit, UV/reactive markers, and weight tolerances";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading legit check details…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Legit check unavailable</h1>
          <p className="text-gray-600 dark:text-gray-400">
            We couldn’t find legit check data for this product. Please go back and try another item.
          </p>
          <Button asChild>
            <Link href="/products">Back to products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const coaId = `COA-${product.id.slice(0, 8).toUpperCase()}`;
  const issuedAt = new Date(product.updatedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <Link href={`/products/${product.id}`} className="hover:text-gray-900 dark:hover:text-gray-100 underline">
            Back to product
          </Link>
        </div>

        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-4 py-1.5 text-emerald-900 dark:text-emerald-100 text-sm font-semibold uppercase tracking-wide">
            <Shield className="h-4 w-4" aria-hidden />
            Certification of Authenticity
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50">{product.name}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            Every unit ships with a third-party COA linked to its digital fingerprint. Use this page to understand the
            legit check process, validation checkpoints, and how to confirm the Certificate of Authenticity on delivery.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" aria-hidden />
              Product snapshot
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Product ID</dt>
                <dd className="font-mono text-gray-900 dark:text-gray-100">{product.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Category</dt>
                <dd className="text-gray-900 dark:text-gray-100">{product.category ?? "General"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Seller</dt>
                <dd className="text-gray-900 dark:text-gray-100">{product.seller?.name || "BrandBazaar"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Focus area</dt>
                <dd className="text-right text-gray-900 dark:text-gray-100">{focusArea}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-500" aria-hidden />
                COA summary
              </h2>
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-100 dark:text-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 rounded-full">
                Active
              </span>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">COA ID</dt>
                <dd className="font-mono text-gray-900 dark:text-gray-100">{coaId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Issued date</dt>
                <dd className="text-gray-900 dark:text-gray-100">{issuedAt}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Inspector tier</dt>
                <dd className="text-gray-900 dark:text-gray-100">Level 2 dual review</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Revalidation window</dt>
                <dd className="text-gray-900 dark:text-gray-100">12 months or resale transfer</dd>
              </div>
            </dl>
            <Button asChild className="w-full mt-4">
              <Link href={`/api/legit-check/coa/${product.id}`} prefetch={false}>
                Download secure COA PDF
              </Link>
            </Button>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Fingerprint className="h-5 w-5 text-purple-500" aria-hidden />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Legit check playbook</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {verificationSteps.map((step) => (
              <div key={step.title} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 p-5 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{step.description}</p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  {step.metrics.map((metric) => (
                    <li key={metric} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
                      {metric}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">COA verification checklist</h2>
            <ul className="space-y-4">
              {coaChecklist.map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span className="mt-1 h-3 w-3 rounded-full bg-emerald-500" aria-hidden />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Third-party provider</h2>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <p>
                <strong className="text-gray-900 dark:text-gray-100">{provider.name}</strong> is an independent audit lab
                specializing in footwear and premium goods. Each certificate is signed off by two inspectors and stored on
                an immutable ledger.
              </p>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt>Turnaround</dt>
                  <dd>{provider.responseTime}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Coverage</dt>
                  <dd>{provider.coverage}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Contact</dt>
                  <dd>{provider.contact}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Hotline</dt>
                  <dd>{provider.hotline}</dd>
                </div>
              </dl>
              <Button variant="secondary" className="w-full">
                Schedule manual review
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 text-white space-y-4">
          <h2 className="text-3xl font-semibold">Need hands-on legit assistance?</h2>
          <p className="text-gray-200 max-w-2xl">
            Our concierge team can live-stream the inspection, share microscope captures, and reissue the COA during the
            unboxing. Drop us a note and we’ll coordinate with LegitLabs™ within two hours.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" className="bg-white text-gray-900 hover:bg-gray-100">
              Book live legit call
            </Button>
            <Button variant="outline" className="border-white/40 text-white hover:bg-white/10">
              Download inspection SOP
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}


