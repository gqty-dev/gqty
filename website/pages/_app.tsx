import type { AppProps } from 'next/app';

import '../styles/globals.css';

/**
 * The site runs on a single project-owned CSS pipeline
 * (`styles/globals.css`, processed by PostCSS). There is no design-system
 * runtime provider and no analytics or telemetry injected at the app level.
 */
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
