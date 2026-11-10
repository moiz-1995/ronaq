import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireVendorPage } from "@/lib/seller";
import { getAttributes, getCategories } from "@/lib/queries";
import { ServiceForm } from "./ServiceForm";

export const metadata = { title: "Edit service" };

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { vendor } = await requireVendorPage(`/seller/services/${id}`);
  const svc = await db.query.vendorServices.findFirst({ where: and(eq(s.vendorServices.id, id), eq(s.vendorServices.vendorId, vendor.id)) });
  if (!svc) notFound();
  const [cat, attrs, [{ n }]] = await Promise.all([
    getCategories().then((cs) => cs.find((c) => c.id === svc.categoryId)),
    getAttributes(svc.categoryId),
    db.select({ n: sql<number>`count(*)` }).from(s.vendorServices).where(eq(s.vendorServices.vendorId, vendor.id)),
  ]);
  return (
    <div className="wrap max-w-3xl py-8">
      <Link href="/seller/services" className="text-sm font-bold text-blue underline">← Saari services</Link>
      <p className="kicker mt-4">{cat?.name}</p>
      <h1 className="h-display mt-1 text-3xl">{svc.title}</h1>
      <ServiceForm
        svc={{ id: svc.id, title: svc.title, description: svc.description, pricingModel: svc.pricingModel, priceAmount: svc.priceAmount, minOrder: svc.minOrder, occasions: svc.occasions ?? [], attributes: svc.attributes ?? {}, active: svc.active }}
        priceModels={(cat?.priceModels ?? []) as string[]}
        attrs={attrs.map((a) => ({ key: a.key, label: a.label, type: a.type, options: a.options ?? [], unit: a.unit, required: a.required, vendorDeclared: a.vendorDeclared, help: a.help }))}
        canDelete={Number(n) > 1}
      />
    </div>
  );
}
