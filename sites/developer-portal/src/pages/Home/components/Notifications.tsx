import { AnimatePresence, motion } from 'framer-motion';
import { useNotifications } from '../../../hooks/useNotifications';
import { Notification } from './Notification';

export const Notifications = () => {
  const notifications = useNotifications();

  return (
    <AnimatePresence initial={false}>
      {notifications.length > 0 ? (
        <motion.div
          className="para:mb-6 para:w-full para:flex para:items-center para:justify-center para:relative"
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {notifications.map((n, i) => (
              <Notification notification={n} index={i} key={n.id} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
