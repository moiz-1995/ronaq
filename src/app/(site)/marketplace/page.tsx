import { MarketView } from "@/components/market/MarketView";

export const metadata = { title: "Marketplace" };

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <MarketView searchParams={await searchParams} />;
}
