import { Button, useFormContext } from '@getpara/react-component-library';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type FloatingSaveButtonProps = {
  shouldShow?: boolean;
};

export const FloatingSaveButton = ({ shouldShow }: FloatingSaveButtonProps) => {
  const form = useFormContext();
  const [mainCenter, setMainCenter] = useState<number | null>(null);

  const mainElement = typeof window !== 'undefined' ? document.querySelector('main') : null;
  useEffect(() => {
    if (!mainElement) return;

    const updateCenter = () => {
      const rect = mainElement.getBoundingClientRect();
      setMainCenter(rect.left + rect.width / 2);
    };

    updateCenter();
    window.addEventListener('resize', updateCenter);
    window.addEventListener('scroll', updateCenter);

    return () => {
      window.removeEventListener('resize', updateCenter);
      window.removeEventListener('scroll', updateCenter);
    };
  }, [mainElement]);

  const { isDirty, isValid, disabled, isSubmitting } = form.formState;
  const canSave = isDirty && isValid && !disabled;

  return (
    <AnimatePresence>
      {mainElement && mainCenter !== null && shouldShow && canSave && (
        <motion.div
          initial={{ y: 64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 64, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{
            left: `${mainCenter}px`,
          }}
          className="para:fixed para:bottom-8 para:z-50 para:-translate-x-1/2"
        >
          <Button size="lg" disabled={isSubmitting} isLoading={isSubmitting} type="submit" className="para:shadow-lg">
            Save Changes
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
