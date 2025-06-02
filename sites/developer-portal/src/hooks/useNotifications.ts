import { useMemo } from 'react';
import { useGetSelectedOrganization } from './api/queries/useOrganizations';
import { useGetOrganizationSubscriptionPlan } from './api/queries/useOrganizationSubscription';
import { useAppStore } from '../stores/app/useAppStore';
import { betaUserLimit, betaUserLimitClose, Notification } from '../utils/notifications';
import { useOrganizationTotalUserCountByAllProjects } from './api/queries/useOrganizationTotalUserCountByProject';

export const useNotifications = () => {
  const { data: org } = useGetSelectedOrganization();
  const { data: plan } = useGetOrganizationSubscriptionPlan();
  const { data: totalUsersByProject } = useOrganizationTotalUserCountByAllProjects();
  const hasDismissedNotification = useAppStore(state => state.hasDismissedNotification);
  const dismissedNotifications = useAppStore(state => state.dismissedNotifications);

  const notifications = useMemo(() => {
    let resp: Notification[] = [];

    if (org && !org.bypassBetaUserLimit) {
      for (const project of totalUsersByProject ?? []) {
        const totalBetaUsers = project?.lowerEnvCount ?? 0;
        const maxBetaUsers = plan?.maxBetaUsers ?? 0;
        const hasReachedLimit = totalBetaUsers >= maxBetaUsers;
        const isCloseToLimit = totalBetaUsers >= maxBetaUsers - 49;

        if (hasReachedLimit) {
          const notification = betaUserLimit({
            id: project.projectId,
            projectName: project.projectName,
            maxBetaUsers,
          });

          if (!hasDismissedNotification(org.id, notification.id)) {
            resp.push(notification);
          }
        } else if (isCloseToLimit) {
          const notification = betaUserLimitClose({
            id: project.projectId,
            projectName: project.projectName,
            maxBetaUsers,
            totalBetaUsers,
          });

          if (!hasDismissedNotification(org.id, notification.id)) {
            resp.push(notification);
          }
        }
      }
    }

    return resp;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDismissedNotification, dismissedNotifications, org, plan?.maxBetaUsers, totalUsersByProject]);

  return notifications;
};
