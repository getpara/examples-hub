import { LANDING_HEADER_LINKS } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Button, ParaBrand } from '@getpara/react-component-library';
import { Link } from 'react-router-dom';

export const LANDING_APP_BAR_HEIGHT = 78;

export const LandingAppBar = () => {
  const isMobile = useIsMobile();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobile && isMenuOpen) {
      setIsMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const handleMenuClick = () => {
    setIsMenuOpen(curr => !curr);
  };

  return (
    <>
      <nav className="para:p-4 para:pb-0 para:w-full para:fixed para:flex para:items-center para:justify-center para:top-0 para:h-auto para:z-10">
        <div className="para:border para:border-border para:max-w-[1183px] para:w-full para:h-auto para:py-5 para:px-6 para:rounded-2xl para:bg-background">
          <div className="para:flex para:items-center para:flex-1 para:gap-2 para:justify-between">
            <ParaBrand className="para:w-auto" />
            {isMobile ? (
              <>
                <Menu className="para:stroke-foreground" onClick={handleMenuClick} />
              </>
            ) : (
              <div className="para:flex para:gap-6 para:items-center">
                {LANDING_HEADER_LINKS.map(({ label, url }) => (
                  <Button key={url} asChild className="para:px-0 para:text-foreground" variant="link">
                    <Link to={url} target="_blank">
                      {label}
                    </Link>
                  </Button>
                ))}
              </div>
            )}
          </div>
          <AnimatePresence>
            {isMobile && isMenuOpen && (
              <motion.div
                className="para:overflow-hidden para:flex-1 para:flex para:flex-col"
                style={{ overflow: 'hidden' }}
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                transition={{ duration: 0.15 }}
                exit={{ height: 0 }}
                key={'container'}
              >
                {LANDING_HEADER_LINKS.map(({ label, url }) => (
                  <Button key={url} asChild className="para:px-0 para:pt-6 para:text-foreground" variant="link">
                    <Link to={url} target="_blank">
                      {label}
                    </Link>
                  </Button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
      <div className="para:h-[94px]" />
    </>
  );
};
