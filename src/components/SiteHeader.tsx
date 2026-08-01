/** Page banner: site title plus anchor navigation to the services section. */
export function SiteHeader() {
  return (
    <header className="site-header">
      <h1>Home</h1>
      <nav aria-label="Page">
        <a href="#services">Services</a>
      </nav>
    </header>
  );
}
