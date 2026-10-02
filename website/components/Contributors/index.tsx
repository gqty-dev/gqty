import { type FunctionComponent } from 'react';
import Member from '../Member';

/**
 * Static list of the people who built GQty. This is intentionally data-free at
 * build time: the site previously queried the GitHub GraphQL API during
 * `getStaticProps`, which required a personal access token and made the build
 * non-deterministic.
 */
const contributors = [
  { name: 'Jack Adams', link: 'https://github.com/jackadams-dev' },
  { name: 'Micha Mailänder', link: 'https://github.com/vicary' },
  { name: 'Carlos Almeida', link: 'https://github.com/caalv' },
  { name: 'Alex Garbled', link: 'https://github.com/alexgarbled' },
];

export type Props = {
  contributors?: Array<{ name: string; link: string }>;
};

const Contributors: FunctionComponent<Props> = ({
  contributors: contributorsProp,
}) => {
  const list = contributorsProp ?? contributors;

  return (
    <section className="contributors" aria-labelledby="contributors">
      <h2 className="display-3" id="contributors">
        Contributors
      </h2>

      <ul className="contributors__list">
        {list.map((contributor) => (
          <li key={contributor.link}>
            <Member
              name={contributor.name}
              link={contributor.link}
              image={`${contributor.link}.png`}
            />
          </li>
        ))}
      </ul>

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
