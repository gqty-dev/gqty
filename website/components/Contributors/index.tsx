import { type FunctionComponent } from 'react';

/**
 * The original component rendered collaborators fetched from the GitHub
 * GraphQL API during `getStaticProps`. That required a personal access token
 * and made the build non-deterministic, so the site now links to the live
 * contributor graph instead of rendering a snapshot.
 *
 * No fixed list of names is kept here: the source never had one, and inventing
 * one would attribute work to the wrong people.
 */
const Contributors: FunctionComponent = () => {
  return (
    <section className="contributors" aria-labelledby="contributors">
      <h2 className="display-3" id="contributors">
        Contributors
      </h2>

      <a
        className="contributors__more"
        href="https://github.com/gqty-dev/gqty/graphs/contributors"
        target="_blank"
        rel="noreferrer"
      >
        See everyone who contributed on GitHub →
      </a>
    </section>
  );
};

export default Contributors;
