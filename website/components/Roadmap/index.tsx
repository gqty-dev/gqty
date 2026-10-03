import { type FunctionComponent } from 'react';
import Check from '../Icons/Play/Check';
import { laneStatus, roadmapGroups } from './roadmap.mjs';

/**
 * Visible roadmap content transcribed from the original JSX. Repeated headings
 * and task entries are intentional. JSX comments are not rendered content.
 *
 * Group order, titles, lane placement, and dates come from `./roadmap.mjs`,
 * which mirrors the rendered content of the original component at commit
 * `229bd7ad`. Duplicated headings and repeated task labels are preserved
 * because the original rendered them.
 */

type Status = 'shipped' | 'progress' | 'todo';

type Task = {
  label: string;
  date?: string;
};

type Group = {
  title: string;
  lanes: Record<Status, Task[]>;
};

export type Props = {
  /** Previously supplied by a GitHub GraphQL query at build time. */
  sponsorship?: {
    totalCount?: number;
    totalRecurringMonthlyPriceInCents?: number;
  };
};

const groups: Group[] = roadmapGroups;

const Roadmap: FunctionComponent<Props> = () => {
  return (
    <section className="roadmap-grid" aria-labelledby="roadmap-heading">
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
                    {group.lanes[lane.status].map((task, taskIndex) => (
                      <li
                        className="roadmap__task"
                        key={`${group.title}-${groupIndex}-${lane.status}-${taskIndex}-${task.label}`}
                      >
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
