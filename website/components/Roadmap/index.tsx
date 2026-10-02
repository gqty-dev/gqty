import { type FunctionComponent } from 'react';
import Check from '../Icons/Play/Check';

type Status = 'shipped' | 'progress' | 'todo';

type Task = {
  label: string;
  date?: string;
};

type Group = {
  title: string;
  /** One entry per column: shipped, in progress, to do. */
  lanes: Record<Status, Task[]>;
};

/**
 * Roadmap content transcribed from the original component. Only the markup
 * changed: the previous implementation used the proprietary design system's
 * `View`/`Timeline`/`Progress` primitives.
 *
 * The original markup repeated itself: the section commented `Streaming`
 * carried a second `Fetch DX` heading, `Fetch DX` declared two "in progress"
 * columns, and two "to do" lists repeated entries already shown above. Those
 * duplicates were commented out or duplicated in the source and are rendered
 * exactly once here; no roadmap entry was added or removed.
 */
const groups: Group[] = [
  // /* GraphQL Functionality */
  {
    title: 'GraphQL Functionality',
    lanes: {
      shipped: [{ label: 'Scoped Query', date: 'Jan 26, 2022' }],
      progress: [],
      todo: [{ label: 'Directives' }, { label: 'Custom Scalars' }],
    },
  },
  // /* Getting Started Experience */
  {
    title: 'Getting Started Experience',
    lanes: {
      shipped: [
        { label: 'Website Relaunch', date: 'Jan 26, 2022' },
        { label: 'Interactive CLI' },
      ],
      progress: [],
      todo: [{ label: 'Directives' }, { label: 'Custom Scalars' }],
    },
  },
  // /* Getting Started Experience (second block) */
  {
    title: 'Getting Started Experience',
    lanes: {
      shipped: [
        { label: 'Website Relaunch' },
        { label: 'Interactive CLI' },
        { label: 'Watch mode in CLI' },
      ],
      progress: [{ label: 'Integration examples Grafbase, Hasura, Svelte...' }],
      todo: [],
    },
  },
  // /* Fetch DX */
  {
    title: 'Fetch DX',
    lanes: {
      shipped: [
        { label: 'Add $refetch to useQuery' },
        { label: 'Refetch on Window Focus in CLI', date: 'Jan 26, 2022' },
        { label: 'Refetch on Reconnect', date: 'Jan 26, 2022' },
        { label: 'Refetch on Mount' },
        { label: 'Support SSR, SSG, RSC' },
      ],
      progress: [
        { label: 'Automatic Polling' },
        { label: 'Cache with expiry and SWR' },
      ],
      todo: [],
    },
  },
  // /* Streaming */
  {
    title: 'Streaming',
    lanes: {
      shipped: [
        { label: 'New subscription client' },
        { label: 'Support SSR, SSG, RSC' },
      ],
      progress: [
        { label: 'Streaming SSR' },
        { label: 'Cache with expiry and SWR' },
      ],
      todo: [],
    },
  },
  // /* Native JS Library Support */
  {
    title: 'Native JS Library Support',
    lanes: {
      shipped: [],
      progress: [],
      todo: [
        { label: 'React Native Hermes' },
        { label: 'Svelte SvelteKit' },
        { label: 'Preact with Signals' },
        { label: 'Vue Nuxt' },
        { label: 'Fresh' },
        { label: 'Solid.js' },
      ],
    },
  },
  // /* DIY Extension */
  {
    title: 'Extend GQty By Yourself',
    lanes: {
      shipped: [],
      progress: [],
      todo: [{ label: 'Plugin System' }],
    },
  },
];

const laneStatus: Array<{ status: Status; heading: string }> = [
  { status: 'shipped', heading: 'Shipped' },
  { status: 'progress', heading: 'In Progress' },
  { status: 'todo', heading: 'To Do' },
];

export type Props = {
  /** Previously supplied by a GitHub GraphQL query at build time. */
  sponsorship?: {
    totalCount?: number;
    totalRecurringMonthlyPriceInCents?: number;
  };
};

const Roadmap: FunctionComponent<Props> = () => {
  return (
    <section className="roadmap-grid" aria-labelledby="roadmap">
      <a className="roadmap__anchor" id="roadmap" aria-hidden="true" />

      <div>
        <h2 className="title-2 roadmap__heading" id="roadmap-heading">
          Our Roadmap
        </h2>

        <div className="roadmap__statuses" aria-hidden="true">
          {laneStatus.map((lane) => (
            <span key={lane.status} className="roadmap__status">
              {lane.heading}
            </span>
          ))}
        </div>

        <div className="roadmap__groups">
          {groups.map((group, groupIndex) => (
            <article
              className="roadmap__group"
              key={`${group.title}-${groupIndex}`}
            >
              <h3 className="roadmap__group-title">{group.title}</h3>

              <div className="roadmap__tasks">
                {laneStatus.map((lane) => (
                  <ul
                    key={lane.status}
                    className={`roadmap__lane roadmap__lane--${lane.status}`}
                  >
                    <li className="roadmap__sr-only">{lane.heading}</li>
                    {group.lanes[lane.status].map((task) => (
                      <li className="roadmap__task" key={task.label}>
                        {lane.status === 'shipped' ? (
                          <Check
                            className="roadmap__task-check"
                            width={10}
                            height={10}
                            aria-hidden="true"
                          />
                        ) : null}
                        {task.label}
                        {task.date ? (
                          <span className="roadmap__date">{task.date}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="roadmap__aside" aria-labelledby="roadmap-funding">
        <div>
          <p className="roadmap__funding-label">Funding goal</p>
          <h2 className="roadmap__funding-title" id="roadmap-funding">
            Working full time on GQty
          </h2>
        </div>

        <p className="roadmap__funding-note">
          Live funding progress is available on GitHub Sponsors.
        </p>

        <div>
          <a
            className="button button--primary button--full"
            href="https://github.com/sponsors/gqty-dev"
            target="_blank"
            rel="noreferrer"
          >
            Join Us
          </a>
        </div>
      </aside>
    </section>
  );
};

export default Roadmap;
