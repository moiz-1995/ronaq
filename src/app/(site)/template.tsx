/** Each page fades in. Opacity only, so fixed elements such as the filter drawer stay put. */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
