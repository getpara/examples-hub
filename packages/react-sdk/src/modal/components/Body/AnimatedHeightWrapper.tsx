import { motion } from 'framer-motion';
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

interface AnimatedHeightWrapperProps extends PropsWithChildren {
  className?: string;
}

export const AnimatedHeightWrapper: React.FC<AnimatedHeightWrapperProps> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        // We only have one entry, so we can use entries[0].
        const observedHeight = entries[0].contentRect.height;
        setHeight(observedHeight);
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        // Cleanup the observer when the component is unmounted
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <Container className={className} style={{ height }} animate={{ height }} transition={{ duration: 0.2 }}>
      <div ref={containerRef}>{children}</div>
    </Container>
  );
};

const Container = styled(motion.div)`
  overflow: hidden;
`;
