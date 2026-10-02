import assert from 'node:assert/strict';
import test from 'node:test';

import { laneStatus, roadmapGroups } from './roadmap.mjs';

/**
 * Rendered task entries transcribed from the original component at
 * `website/components/Roadmap/index.tsx` in commit `229bd7ad`.
 *
 * The original source contained 34 `body-medium-2` task labels, but two of
 * them (the `Streaming` group's `To Do` column, `Directives` and
 * `Custom Scalars`) sit inside a JSX comment block and never render. The
 * remaining 32 entries are the visible roadmap content, grouped by the
 * heading the original actually displayed.
 *
 * Entries repeat on purpose: the original rendered three duplicated headings
 * and repeated several task labels across groups.
 */
const expectedGroups = [
  {
    title: 'GraphQL Functionality',
    lanes: {
      shipped: ['Scoped Query'],
      progress: [],
      todo: ['Directives', 'Custom Scalars'],
    },
  },
  {
    title: 'Getting Started Experience',
    lanes: {
      shipped: ['Website Relaunch', 'Interactive CLI'],
      progress: [],
      todo: ['Directives', 'Custom Scalars'],
    },
  },
  {
    title: 'Getting Started Experience',
    lanes: {
      shipped: ['Website Relaunch', 'Interactive CLI', 'Watch mode in CLI'],
      progress: [
        'Integration examples Grafbase, Hasura, Svelte...',
        'Integration examples Grafbase, Hasura, Svelte...',
      ],
      todo: [],
    },
  },
  {
    title: 'Fetch DX',
    lanes: {
      shipped: [
        'Add $refetch to useQuery',
        'Refetch on Window Focus in CLI',
        'Refetch on Reconnect',
        'Refetch on Mount',
        'Support SSR, SSG, RSC',
        'Support SSR, SSG, RSC',
      ],
      progress: [
        'Automatic Polling',
        'Cache with expiry and SWR',
        'Automatic Polling',
        'Cache with expiry and SWR',
      ],
      todo: [],
    },
  },
  {
    // The original source commented this section `Streaming`, but rendered the
    // visible title `Fetch DX`. Only the comment is not rendered content.
    title: 'Fetch DX',
    lanes: {
      shipped: ['New subscription client'],
      progress: ['Streaming SSR', 'Cache with expiry and SWR'],
      todo: [],
    },
  },
  {
    title: 'Native JS Library Support',
    lanes: {
      shipped: [],
      progress: [],
      todo: [
        'React Native Hermes',
        'Svelte SvelteKit',
        'Preact with Signals',
        'Vue Nuxt',
        'Fresh',
        'Solid.js',
      ],
    },
  },
  {
    title: 'Extend GQty By Yourself',
    lanes: {
      shipped: [],
      progress: [],
      todo: ['Plugin System'],
    },
  },
];

const laneOrder = ['shipped', 'progress', 'todo'];

function labelsOf(groups) {
  return groups.map((group) => ({
    title: group.title,
    shipped: group.lanes.shipped.map((task) =>
      typeof task === 'string' ? task : task.label
    ),
    progress: group.lanes.progress.map((task) =>
      typeof task === 'string' ? task : task.label
    ),
    todo: group.lanes.todo.map((task) =>
      typeof task === 'string' ? task : task.label
    ),
  }));
}

test('the roadmap renders every visible entry from the original source', () => {
  assert.deepEqual(labelsOf(roadmapGroups), labelsOf(expectedGroups));
});

test('the roadmap renders exactly 32 task entries across 7 groups', () => {
  const total = roadmapGroups.reduce(
    (count, group) =>
      count +
      laneOrder.reduce(
        (laneCount, lane) => laneCount + group.lanes[lane].length,
        0
      ),
    0
  );
  assert.equal(roadmapGroups.length, 7);
  assert.equal(total, 32);
});

test('per-group task counts match the original source', () => {
  const perGroup = roadmapGroups.map((group) =>
    laneOrder.reduce((count, lane) => count + group.lanes[lane].length, 0)
  );
  assert.deepEqual(perGroup, [3, 4, 5, 10, 3, 6, 1]);
});

test('the Streaming source block keeps its rendered Fetch DX title', () => {
  // The original carried `{/* Streaming */}` immediately above a group whose
  // visible heading was `Fetch DX`.
  const streaming = roadmapGroups[4];
  assert.equal(streaming.title, 'Fetch DX');
  assert.equal(streaming.sourceComment, 'Streaming');
});

test('every group exposes the three status lanes', () => {
  for (const group of roadmapGroups) {
    assert.deepEqual(Object.keys(group.lanes).sort(), [...laneOrder].sort());
    for (const lane of laneOrder) {
      assert.ok(Array.isArray(group.lanes[lane]));
    }
  }
});

test('the lane headings stay Shipped, In Progress, To Do', () => {
  assert.deepEqual(
    laneStatus.map((lane) => [lane.status, lane.heading]),
    [
      ['shipped', 'Shipped'],
      ['progress', 'In Progress'],
      ['todo', 'To Do'],
    ]
  );
});

test('dates are preserved for the entries that carry one', () => {
  const dates = roadmapGroups.flatMap((group) =>
    laneOrder.flatMap((lane) =>
      group.lanes[lane]
        .filter((task) => task.date !== undefined)
        .map((task) => `${task.label} @ ${task.date}`)
    )
  );
  assert.deepEqual(dates, [
    'Scoped Query @ Jan 26, 2022',
    'Website Relaunch @ Jan 26, 2022',
    'Refetch on Window Focus in CLI @ Jan 26, 2022',
    'Refetch on Reconnect @ Jan 26, 2022',
  ]);
});

test('react keys stay unique because the label is combined with an index', () => {
  // Duplicated labels and duplicated group headings are intentional, so a key
  // derived from either alone would collide. The render key must combine the
  // group index, the lane, the task index, and the label.
  const keys = roadmapGroups.flatMap((group, groupIndex) =>
    laneOrder.flatMap((lane) =>
      group.lanes[lane].map((task, taskIndex) =>
        [`${group.title}-${groupIndex}`, lane, taskIndex, task.label].join('|')
      )
    )
  );
  assert.equal(keys.length, 32);
  assert.equal(new Set(keys).size, keys.length);
});
