/** Shown when the service inventory is empty. */
export function EmptyState() {
  return (
    <div className="empty-state">
      <p>No services configured yet.</p>
      <p>
        Add entries to <code>src/content/services.json</code> and rebuild to populate this page.
      </p>
    </div>
  );
}
