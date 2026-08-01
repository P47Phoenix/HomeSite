export interface SiteHeaderProps {
  /** Site name (decided at Checkpoint 1). Rendered as the page's only h1. */
  siteName: string;
  /** Muted secondary line, e.g. "Home-lab services on the LAN". Omit to render name only. */
  tagline?: string;
}

/** Page identity: the only h1 plus an optional muted tagline. No navigation — hub-and-spoke. */
export function SiteHeader({ siteName, tagline }: SiteHeaderProps) {
  return (
    <header className="wrap">
      <div className="site-name">
        <h1>{siteName}</h1>
      </div>
      {tagline !== undefined && <p className="tagline">{tagline}</p>}
    </header>
  );
}
