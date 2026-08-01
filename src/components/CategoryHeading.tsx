export interface CategoryHeadingProps {
  /** Category display name, e.g. "Infrastructure". */
  name: string;
}

/** Category section heading inside the service grid (h3 under the page h1 / section h2). */
export function CategoryHeading({ name }: CategoryHeadingProps) {
  return <h3 className="category-heading">{name}</h3>;
}
