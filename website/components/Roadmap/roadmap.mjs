/**
 * Roadmap content transcribed from the original component.
 *
 * The source is `website/components/Roadmap/index.tsx` at commit `229bd7ad`.
 * The entries below are the content that actually rendered there. The original
 * markup repeated headings and task labels; those repetitions are preserved
 * here rather than folded together, because they were visible content.
 *
 * Kept free of React and of the previous design system so the mapping can be
 * compared against the source directly in `roadmap.test.mjs`.
 *
 * @typedef {'shipped' | 'progress' | 'todo'} Status
 * @typedef {{ label: string, date?: string }} Task
 */

/** @type {Array<{ status: Status, heading: string }>} */
export const laneStatus = [
  { status: 'shipped', heading: 'Shipped' },
  { status: 'progress', heading: 'In Progress' },
  { status: 'todo', heading: 'To Do' },
];

/**
 * One entry per roadmap group, in source order. `sourceComment` records the
 * JSX comment that introduced the group in the original; comments are not
 * rendered, so `title` carries what the page actually displayed.
 *
 * Deliberately untyped here: `index.tsx` assigns this to its own `Group[]`,
 * which is what validates the shape. A JSDoc cast would mask mistakes.
 */
export const roadmapGroups = [
  {
    title: 'GraphQL Functionality',
    sourceComment: 'GraphQL Functionality',
    lanes: {
      shipped: [{ label: 'Scoped Query', date: 'Jan 26, 2022' }],
      progress: [],
      todo: [{ label: 'Directives' }, { label: 'Custom Scalars' }],
    },
  },
  {
    title: 'Getting Started Experience',
    sourceComment: 'Getting Started Experience',
    lanes: {
      shipped: [
        { label: 'Website Relaunch', date: 'Jan 26, 2022' },
        { label: 'Interactive CLI' },
      ],
      progress: [],
      todo: [{ label: 'Directives' }, { label: 'Custom Scalars' }],
    },
  },
  {
    title: 'Getting Started Experience',
    sourceComment: 'Getting Started Experience',
    lanes: {
      shipped: [
        { label: 'Website Relaunch' },
        { label: 'Interactive CLI' },
        { label: 'Watch mode in CLI' },
      ],
      // The original declared this group with two "In Progress" columns, both
      // holding the same entry.
      progress: [
        { label: 'Integration examples Grafbase, Hasura, Svelte...' },
        { label: 'Integration examples Grafbase, Hasura, Svelte...' },
      ],
      todo: [],
    },
  },
  {
    title: 'Fetch DX',
    sourceComment: 'Fetch DX',
    lanes: {
      shipped: [
        { label: 'Add $refetch to useQuery' },
        { label: 'Refetch on Window Focus in CLI', date: 'Jan 26, 2022' },
        { label: 'Refetch on Reconnect', date: 'Jan 26, 2022' },
        { label: 'Refetch on Mount' },
        { label: 'Support SSR, SSG, RSC' },
        { label: 'Support SSR, SSG, RSC' },
      ],
      // The original declared this group with two "In Progress" columns, each
      // holding the same two entries in the same order.
      progress: [
        { label: 'Automatic Polling' },
        { label: 'Cache with expiry and SWR' },
        { label: 'Automatic Polling' },
        { label: 'Cache with expiry and SWR' },
      ],
      todo: [],
    },
  },
  {
    // The original introduced this group with `{/* Streaming */}` but rendered
    // the visible title `Fetch DX`. Comments are not rendered content, so the
    // displayed title is what is preserved.
    title: 'Fetch DX',
    sourceComment: 'Streaming',
    lanes: {
      shipped: [{ label: 'New subscription client' }],
      progress: [
        { label: 'Streaming SSR' },
        { label: 'Cache with expiry and SWR' },
      ],
      todo: [],
    },
  },
  {
    title: 'Native JS Library Support',
    sourceComment: 'Native JS Library Support',
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
  {
    title: 'Extend GQty By Yourself',
    sourceComment: 'DIY Extension',
    lanes: {
      shipped: [],
      progress: [],
      todo: [{ label: 'Plugin System' }],
    },
  },
];
