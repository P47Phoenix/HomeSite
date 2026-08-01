import type { Service } from './types';
import { ServiceGrid, SiteFooter, SiteHeader } from './components';

export interface AppProps {
  services: Service[];
}

/** Full page assembly. Rendered to static markup at build time (scripts/prerender.tsx). */
export function App({ services }: AppProps) {
  return (
    <>
      <SiteHeader />
      <main>
        <section id="services" aria-labelledby="services-heading">
          <h2 id="services-heading">Services</h2>
          <ServiceGrid services={services} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
