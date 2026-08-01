/** Spec §4: longer strings are a content error; rendering clamps at 2 characters. */
const MAX_LABEL_LENGTH = 2;

export interface MonogramBadgeProps {
  /** 1–2 uppercase characters, e.g. "HA". Longer strings are a content error; clamp at 2. */
  label: string;
}

/** Decorative monogram badge. Hidden from assistive tech — the card name carries the meaning. */
export function MonogramBadge({ label }: MonogramBadgeProps) {
  return (
    <span className="badge" aria-hidden="true">
      {label.slice(0, MAX_LABEL_LENGTH)}
    </span>
  );
}
