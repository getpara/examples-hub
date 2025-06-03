import { TriangleAlert, X } from 'lucide-react';
import { FlatCard } from '../../../components/FlatCard';
import { cn, Typography } from '@getpara/react-component-library';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../../../stores/app/useAppStore';
import { Notification as TNotification } from '../../../utils/notifications';
import React from 'react';

type NotificationProps = {
  notification: TNotification;
  index: number;
  firstNotificationHeight?: number;
};

export const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ notification, index }: NotificationProps, ref) => {
    const { organizationId } = useParams();
    const dismissNotification = useAppStore(state => state.dismissNotification);

    const handleDismiss = (id: string) => () => {
      if (!organizationId) {
        return;
      }
      dismissNotification(organizationId, id);
    };

    return (
      <motion.div
        ref={ref}
        className={cn('para:relative', {
          'para:absolute': index !== 0,
          'para:top-0': index !== 0,
        })}
        animate={{
          opacity: 1,
          scale: index !== 0 ? 0.95 : 1,
          bottom: index !== 0 ? -8 : 0,
          zIndex: index !== 0 ? -1 : 1,
        }}
        exit={{ opacity: 0, transform: 'translateY(-40px)', zIndex: 2 }}
        transition={{ duration: 0.25 }}
      >
        <FlatCard className={'para:py-3 para:px-4 para:gap-1 para:relative para:max-w-[634px] para:h-full'}>
          <div
            className="para:absolute para:right-0 para:top-0 para:size-auto para:p-1 para:opacity-50 para:cursor-pointer"
            onClick={handleDismiss(notification.id)}
          >
            <X className="para:size-4" />
          </div>
          <TriangleAlert
            className={cn('para:stroke-amber-600 para:size-4 para:absolute', {
              'para:stroke-destructive': notification.type === 'error',
              'para:stroke-foreground': notification.type === 'info',
            })}
          />
          <div
            className={cn('para:flex para:flex-col para:gap-1 para:pl-7', {
              'para: para:overflow-auto': index !== 0,
            })}
          >
            {typeof notification.title === 'string' ? (
              <Typography
                className={cn('para:text-sm para:leading-none para:text-amber-600 para:font-medium', {
                  'para:text-destructive': notification.type === 'error',
                  'para:text-foreground': notification.type === 'info',
                })}
              >
                {notification.title}
              </Typography>
            ) : (
              notification.title
            )}
            {typeof notification.title === 'string' ? (
              <Typography className="para:text-sm">{notification.message}</Typography>
            ) : (
              notification.message
            )}
          </div>
        </FlatCard>
      </motion.div>
    );
  },
);
