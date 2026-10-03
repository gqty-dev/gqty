/**
 * The interactive example lives on StackBlitz and is opened, not embedded.
 *
 * This project always serves the site from `https://gqty-dev.github.io/gqty/`.
 * Embedding the editor there does not work: StackBlitz runs the example in a
 * WebContainer, which needs a cross-origin-isolated document
 * (`Cross-Origin-Opener-Policy: same-origin` plus
 * `Cross-Origin-Embedder-Policy: require-corp`). GitHub Pages serves only
 * static files and cannot send those headers, so the embedded preview fails
 * with a missing cross-origin-isolation error instead of loading. Only the
 * top-level StackBlitz page supplies that isolation.
 *
 * The section therefore shows the example's own source and the query GQty
 * generates from it — both taken from `guides/react/read` — and links out to
 * the real editor. No external preview asset is fetched, and the illustration
 * renders without JavaScript.
 */
const PLAYGROUND_PROJECT_URL = 'https://stackblitz.com/edit/nextjs-2jqmx4';

const Playground = () => {
  return (
    <section className="playground" aria-labelledby="playground">
      <div className="playground__heading-shell">
        <span className="playground__heading-echo" aria-hidden="true">
          <span className="playground__heading">Play</span>
          <span className="playground__heading">ground</span>
        </span>
        <h2 className="playground__heading" id="playground">
          Playground
        </h2>
      </div>

      <div className="playground__frame">
        <div className="playground__glow" aria-hidden="true" />
        <div className="playground__viewport">
          <div className="playground__panel">
            <p className="playground__panel-label">The component you write</p>
            <pre className="playground__code">
              <code>{`import { useQuery } from '../gqty';

export default function Profile() {
  const { me } = useQuery();

  return (
    <>
      <h1>Hello {me.name}!</h1>
    </>
  );
}`}</code>
            </pre>
          </div>

          <div className="playground__panel">
            <p className="playground__panel-label">The query GQty sends</p>
            <pre className="playground__code">
              <code>{`query {
  me {
    __typename
    id
    name
  }
}`}</code>
            </pre>
          </div>
        </div>

        <div className="playground__launch">
          <a
            className="playground__launch-link"
            href={PLAYGROUND_PROJECT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open interactive example on StackBlitz
          </a>
          <p className="playground__caption">
            The interactive example opens externally on StackBlitz, where it
            runs in the browser. The editor cannot be embedded here because
            GitHub Pages cannot serve the cross-origin isolation headers a
            WebContainer needs, so the code above is shown instead.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Playground;
