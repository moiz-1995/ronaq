import Link from "next/link";
import { MapPin } from "lucide-react";
import { Picture } from "@/components/art/CraftArt";
import { FoundingBadge, Stars } from "@/components/ui/badges";
import { displayPrice } from "@/lib/price";
import type { VendorCardData } from "@/lib/queries";
import { SaveButton } from "./SaveButton";
import { Tilt } from "./Tilt";

const MODE_LABEL: Record<string, string> = { home_visit: "Home visit", on_site: "At venue", premises: "At their studio", delivery: "Delivery", remote: "Online" };

export function VendorCard({ data, saved, seed = 0, sponsored = false }: { data: VendorCardData; saved: boolean; seed?: number; sponsored?: boolean }) {
  const { vendor: v, service, category } = data;
  const price = service ? displayPrice(service.pricingModel, service.priceAmount) : null;
  const cover = v.coverImage ?? v.logoImage;
  return (
    <Tilt>
      <article className="card card-shadow relative h-full overflow-visible bg-white">
        {v.founding && <FoundingBadge className="absolute left-3.5 top-3.5 z-10" />}
        {sponsored && <span className="chip absolute bottom-[calc(100%-2.6rem)] right-3.5 z-10 bg-sun">SPONSORED</span>}
        <div className="absolute right-3 top-3 z-10"><SaveButton vendorId={v.id} saved={saved} /></div>
        <Link href={`/v/${v.slug}`} className="block focus-visible:outline-offset-[-3px]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-t-[19px] border-b-[3px] border-ink">
            <Picture src={cover} alt={`${v.name} cover`} fallbackKind={category?.art ?? "henna"} seed={seed + 11} className="h-full w-full" />
            {cover && !cover.startsWith("art:") && <span className="absolute bottom-2 right-2 rounded-full bg-ink px-2 py-1 text-[10px] font-medium text-sand">Vendor&apos;s own cover</span>}
          </div>
          <div className="grid gap-1 p-4">
            {category && <p className="font-display text-[11px] tracking-wide text-blue">{category.name.toUpperCase()}</p>}
            <h3 className="font-display text-lg leading-tight">{v.name}</h3>
            <p className="flex items-center gap-1 text-[13px] text-mute">
              <MapPin size={13} /> {[data.areaName, data.cityName].filter(Boolean).join(", ")}
              {v.modes?.[0] ? <> · {MODE_LABEL[v.modes[0]]}</> : null}
            </p>
            <Stars value={v.ratingAvg} count={v.ratingCount} />
            {price && (
              <div className="dashed-top mt-2 flex items-baseline justify-between gap-2 pt-2 text-[13px]">
                <span className="text-mute">{price.lead}</span>
                <b className="font-display text-base text-red">{price.amount}</b>
                <span className="text-mute">{price.unit}</span>
              </div>
            )}
          </div>
        </Link>
      </article>
    </Tilt>
  );
}
