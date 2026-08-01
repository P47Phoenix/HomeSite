export interface MonogramBadgeProps {
  /** 1-2 uppercase characters, e.g. "TN". */
  monogram: string;
}

/** Decorative monogram badge. Hidden from assistive tech — the card name carries the meaning. */
export function MonogramBadge({ monogram }: MonogramBadgeProps) {
  return (
    <span className="monogram-badge" aria-hidden="true">
      {monogram}
    </span>
  );
}
