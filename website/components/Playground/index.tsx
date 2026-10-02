const PLAYGROUND_EMBED_URL =
  'https://stackblitz.com/edit/nextjs-2jqmx4?embed=1&file=src%2Fcomponents%2FQuery.tsx&hideExplorer=1&hideNavigation=1';

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
          <iframe
            id="playground"
            src={PLAYGROUND_EMBED_URL}
            title="GQty interactive example on StackBlitz"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
          <p className="playground__fallback">
            Can&rsquo;t see the playground?{' '}
            <a href={PLAYGROUND_PROJECT_URL} target="_blank" rel="noreferrer">
              Open the interactive example
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
};

export default Playground;
