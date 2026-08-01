export interface SiteFooterProps {
  /** Footer line; interpunct-separated segments recommended. */
  text: string;
}

/** Identity + scope statement. Muted small text, no links — nothing to link to. */
export function SiteFooter({ text }: SiteFooterProps) {
  return (
    <footer>
      <div className="wrap">{text}</div>
    </footer>
  );
}
