import {
  Children,
  isValidElement,
  useCallback,
  useId,
  useRef,
  useState,
  type FunctionComponent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { nextTabIndex } from './keyboard.mjs';

export type TabItemProps = {
  label: string;
  children?: ReactNode;
};

const TabItem: FunctionComponent<TabItemProps> = () => null;

TabItem.displayName = 'TabItem';

export type TabsProps = {
  children?: ReactNode;
  /** Index of the tab selected on first render. */
  initialIndex?: number;
};

/**
 * Accessible tab list used by the documentation pages that previously imported
 * the design system's `Tabs` primitives. Panels are kept in the document and
 * toggled with `hidden` so that coded tabs and anchors inside them still render.
 */
export const Tabs: FunctionComponent<TabsProps> & {
  Item: FunctionComponent<TabItemProps>;
} = ({ children, initialIndex = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const items = Children.toArray(children).filter(
    (child): child is ReactElement<TabItemProps> =>
      isValidElement<TabItemProps>(child) && child.type === TabItem
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      const next = nextTabIndex(event.key, activeIndex, items.length);
      if (next === activeIndex) return;

      // Only keys the tablist claims should be swallowed, so Tab still moves
      // focus out of the list.
      event.preventDefault();
      setActiveIndex(next);
      tabRefs.current[next]?.focus();
    },
    [activeIndex, items.length]
  );

  if (items.length === 0) return null;

  return (
    <div className="tabs">
      <div className="tabs__list" role="tablist">
        {items.map((item, index) => {
          const selected = index === activeIndex;

          return (
            <button
              key={`${baseId}-tab-${index}`}
              id={`${baseId}-tab-${index}`}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              className="tabs__tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${index}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              onKeyDown={handleKeyDown}
            >
              {item.props.label}
            </button>
          );
        })}
      </div>

      {items.map((item, index) => (
        <div
          key={`${baseId}-panel-${index}`}
          id={`${baseId}-panel-${index}`}
          className="tabs__panel"
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={index !== activeIndex}
        >
          {item.props.children}
        </div>
      ))}
    </div>
  );
};

Tabs.Item = TabItem;

export { TabItem };

export default Tabs;
