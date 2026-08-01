const DEFAULT_MESSAGE = 'No services listed yet.';

export interface EmptyStateProps {
  /** Override the default line. Default: "No services listed yet." */
  message?: string;
}

/** Zero-services placeholder: one static line in a quiet panel. No illustration, no CTA. */
export function EmptyState({ message = DEFAULT_MESSAGE }: EmptyStateProps) {
  return <p className="empty">{message}</p>;
}
