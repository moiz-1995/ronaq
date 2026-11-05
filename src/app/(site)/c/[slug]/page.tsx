import { notFound } from "next/navigation";
import { MarketView } from "@/components/market/MarketView";
import { getCategoryBySlug } from "@/lib/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const c = await getCategoryBySlug((await params).slug);
  return { title: c ? `${c.name} in Rawalpindi & Islamabad` : "Category" };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const category = await getCategoryBySlug((await params).slug);
  if (!category || !category.active) notFound();
  return <MarketView searchParams={await searchParams} category={category} />;
}
