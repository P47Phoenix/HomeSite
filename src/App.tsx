import type { Service } from './types';
import { ServiceGrid, SiteFooter, SiteHeader } from './components';

export interface AppProps {
  services: Service[];
}

/** Full page assembly. Rendered to static markup at build time (scripts/prerender.tsx). */
export function App({ services }: AppProps) {
  return (
    <>
      <SiteHeader siteName="Connelly Lab" tagline="Home-lab services on the LAN" />
      <main className="wrap">
        <h2>Services</h2>
        <ServiceGrid services={services} />
      </main>
      <SiteFooter text={'Connelly Lab · LAN only · served from the Talos cluster'} />
    </>
  );
}
