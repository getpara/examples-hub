import * as comp from '@getpara/react-components';
import { safeStyled } from '@getpara/react-common';
import { ReactNode, useState, useMemo, useRef, useEffect } from 'react';
import { GradientScroll } from './common.js';
import { AnimatePresence, motion } from 'framer-motion';

type AssetItem = {
  key: string;
  icon: ReactNode;
  text: ReactNode;
  textSecondary?: ReactNode;
  endText?: ReactNode;
  endTextSecondary?: ReactNode;
};

export const contentMotionProps = {
  transition: { duration: 0.2 },
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Estimated item height including gap (button ~64px + gap 8px = 72px)
const ESTIMATED_ITEM_HEIGHT = 72;
// Number of items to render above/below viewport for smoother scrolling
const VISIBILITY_BUFFER = 3;

export function SearchableButtonList<T>({
  items,
  transformItem,
  searchFilter,
  searchPlaceholder = 'Search for an asset',
  onSelect,
}: {
  items: T[];
  transformItem: (_: T) => AssetItem;
  searchFilter?: (_: { item: T; searchStr: string }) => boolean;
  searchPlaceholder?: string;
  onSelect: (_: T) => void;
}) {
  const [searchStr, setSearchStr] = useState('');
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [renderedRange, setRenderedRange] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

  // Transform and filter together in a single memoized step
  // This avoids calling transformItem on every render and only recalculates when items/search change
  const transformedAndFiltered = useMemo(() => {
    return items
      .filter(item => !searchFilter || searchFilter({ item, searchStr }))
      .map(item => ({
        assetItem: transformItem(item),
        originalItem: item,
      }));
  }, [items, searchFilter, searchStr, transformItem]);

  // Reset rendered range when items or search changes (different items = different keys)
  useEffect(() => {
    setRenderedRange({ start: 0, end: 0 });
  }, [items, searchStr]);

  // Calculate desired visible range based on scroll position
  const desiredRange = useMemo(() => {
    if (containerHeight === 0) {
      // If container height is unknown, show all items
      return { start: 0, end: transformedAndFiltered.length };
    }

    const startIndex = Math.max(0, Math.floor(scrollTop / ESTIMATED_ITEM_HEIGHT) - VISIBILITY_BUFFER);
    const endIndex = Math.min(
      transformedAndFiltered.length,
      Math.ceil((scrollTop + containerHeight) / ESTIMATED_ITEM_HEIGHT) + VISIBILITY_BUFFER,
    );

    return { start: startIndex, end: endIndex };
  }, [scrollTop, containerHeight, transformedAndFiltered.length]);

  // Update the rendered range to expand but never shrink based on desired range
  useEffect(() => {
    setRenderedRange(prev => ({
      start: Math.min(desiredRange.start, prev.start),
      end: Math.max(desiredRange.end, prev.end),
    }));
  }, [desiredRange]);

  // Use rendered range for actual rendering
  const visibleRange = renderedRange;

  const visibleItems = useMemo(() => {
    return transformedAndFiltered.slice(visibleRange.start, visibleRange.end);
  }, [transformedAndFiltered, visibleRange.start, visibleRange.end]);

  useEffect(() => {
    // The scroll container is the parent of the div that GradientScroll wraps children in
    const container = scrollContainerRef.current?.parentElement?.parentElement;
    if (!container) return;

    const updateDimensions = () => {
      setContainerHeight(container.clientHeight);
      // Track content height (scrollHeight) to determine if we need to reduce height
      setContentHeight(container.scrollHeight);
    };

    let scrollTimeout: number | undefined;
    const handleScroll = () => {
      // Throttle scroll updates to avoid excessive re-renders
      if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
      }
      scrollTimeout = requestAnimationFrame(() => {
        setScrollTop(container.scrollTop);
      });
    };

    updateDimensions();
    container.addEventListener('scroll', handleScroll, { passive: true });
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    // Also observe the inner content div to catch content height changes
    const contentDiv = scrollContainerRef.current;
    if (contentDiv) {
      const contentResizeObserver = new ResizeObserver(updateDimensions);
      contentResizeObserver.observe(contentDiv);
      return () => {
        if (scrollTimeout) {
          cancelAnimationFrame(scrollTimeout);
        }
        container.removeEventListener('scroll', handleScroll);
        resizeObserver.disconnect();
        contentResizeObserver.disconnect();
      };
    }

    return () => {
      if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
      }
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  const paddingTop = visibleRange.start * ESTIMATED_ITEM_HEIGHT;
  const paddingBottom = Math.max(0, (transformedAndFiltered.length - visibleRange.end) * ESTIMATED_ITEM_HEIGHT);

  // The max height for the outer container (480px)
  const MAX_CONTAINER_HEIGHT = 480;

  // Update content height when rendered range changes (affects total content height via padding)
  useEffect(() => {
    const container = scrollContainerRef.current?.parentElement?.parentElement;
    if (container) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        setContentHeight(container.scrollHeight);
      });
    }
  }, [visibleRange.start, visibleRange.end, transformedAndFiltered.length]);

  // Calculate the dynamic height for the outer container
  const outerContainerHeight = useMemo(() => {
    if (contentHeight === 0) {
      return MAX_CONTAINER_HEIGHT;
    }

    const searchInputHeight = items.length >= 4 && !!searchFilter ? 56 : 0;
    const totalNeededHeight = contentHeight + searchInputHeight;

    // If content is smaller than max, shrink to fit
    // Otherwise, use max height to allow scrolling
    if (totalNeededHeight < MAX_CONTAINER_HEIGHT) {
      return totalNeededHeight + 4; // Small buffer for proper rendering
    }

    return MAX_CONTAINER_HEIGHT;
  }, [contentHeight, items.length, searchFilter]);

  return (
    <div
      ref={outerContainerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: `${outerContainerHeight}px`,
        maxHeight: `${MAX_CONTAINER_HEIGHT}px`,
        overflow: 'hidden',
      }}
    >
      {items.length >= 4 && !!searchFilter && (
        <SearchInput
          placeholder={searchPlaceholder}
          value={searchStr}
          onCpslInput={e => {
            setSearchStr(e.detail.value);
          }}
          style={{ marginBottom: '8px' }}
        >
          <comp.CpslIcon icon="search" slot="start" />
        </SearchInput>
      )}
      <GradientScroll height="100%" gap="8px">
        <div ref={scrollContainerRef}>
          <List style={{ paddingTop, paddingBottom }}>
            <AnimatePresence mode="sync">
              {visibleItems.map(({ assetItem, originalItem }) => {
                const { key, icon, text, textSecondary, endText, endTextSecondary } = assetItem;
                return (
                  <motion.li key={key} style={{ width: '100%' }} {...contentMotionProps}>
                    <AssetButton fullWidth variant="secondary" onClick={() => onSelect(originalItem)}>
                      {icon}
                      <Info>
                        <Code color="contrast" variant="bodyL">
                          {text}
                        </Code>
                        {textSecondary && (
                          <Name color="contrast" variant="bodyS">
                            {textSecondary}
                          </Name>
                        )}
                      </Info>

                      {endText && (
                        <End>
                          <EndText color="primary" variant="bodyM">
                            {endText}
                          </EndText>
                          {endTextSecondary && (
                            <EndTextSecondary color="contrast" variant="bodyS">
                              {endTextSecondary}
                            </EndTextSecondary>
                          )}
                        </End>
                      )}
                    </AssetButton>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </List>
        </div>
      </GradientScroll>
    </div>
  );
}

const List = safeStyled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
  list-style: none;
  padding-inline-start: 0;
  padding-inline-end: 0;
  margin: 0;
`;

const AssetButton = safeStyled(comp.CpslButton)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  --button-secondary-background-color: var(--cpsl-color-background-8);
  --button-secondary-border-color: var(--cpsl-color-background-8);
  --button-secondary-hover-background-color: var(--cpsl-color-background-16);
  --button-secondary-hover-border-color: var(--cpsl-color-background-16);
`;

const Info = safeStyled(comp.CpslCol)`
    text-align: left;
    min-width: 0;
  `,
  Code = comp.CpslText,
  Name = safeStyled(comp.CpslText)`
    display: flex;
    align-items: flex-start;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    height: 20px;
  `,
  EndText = safeStyled(comp.CpslText)`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  `,
  EndTextSecondary = safeStyled(comp.CpslText)`
    overflow: hidden;
  `;

const End = safeStyled(comp.CpslCol)`
  text-align: right;
  align-items: flex-end;
  gap: 4px;
  min-width: 0;
`;

const SearchInput = safeStyled(comp.CpslInput)`
  --container-background-color: var(--cpsl-color-background-8);
  --input-background-color: transparent;
`;
