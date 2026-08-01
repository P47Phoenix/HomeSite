export interface CategoryHeadingProps {
  /** Category label, e.g. "Home Automation". */
  title: string;
}

/** Category band separator (h3 under the "Services" h2) — grouped state only. */
export function CategoryHeading({ title }: CategoryHeadingProps) {
  return <h3>{title}</h3>;
}
