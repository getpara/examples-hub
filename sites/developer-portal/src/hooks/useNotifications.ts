import { useMemo } from 'react';
import { useGetSelectedOrganization } from './api/queries/useOrganizations';
import { useGetOrganizationSubscriptionPlan } from './api/queries/useOrganizationSubscription';
import { useAppStore } from '../stores/app/useAppStore';
import { betaUserLimit, betaUserLimitClose, mauLimit, mauLimitClose, Notification } from '../utils/notifications';
import { useOrganizationTotalUserCountByAllProjects } from './api/queries/useOrganizationTotalUserCountByProject';
import { FREE_PLAN_SLUG } from '../utils/constants';
import { useOrganizationMonthlyActiveUsersTS } from './api/queries/useOrganizationMonthlyActiveUsersTS';
import { useNavigate } from 'react-router-dom';

export const useNotifications = () => {
  const { data: org } = useGetSelectedOrganization();
  const { data: plan } = useGetOrganizationSubscriptionPlan();
  const { data: totalUsersByProject } = useOrganizationTotalUserCountByAllProjects();
  const { data: monthlyActiveUsers } = useOrganizationMonthlyActiveUsersTS();
  const hasDismissedNotification = useAppStore(state => state.hasDismissedNotification);
  const dismissedNotifications = useAppStore(state => state.dismissedNotifications);
  const navigate = useNavigate();

  const notifications = useMemo(() => {
    let resp: Notification[] = [];

    if (org) {
      if (plan?.slug === FREE_PLAN_SLUG) {
        const totalMaus = monthlyActiveUsers?.[monthlyActiveUsers?.length - 1]?.activeUsers ?? 0;
        const maxMaus = plan?.maxProdMAUs ?? 0;
        const hasReachedLimit = totalMaus >= maxMaus;
        const isCloseToLimit = totalMaus >= maxMaus - 200;

        const handleActionClick = () => {
          navigate(`/${org.id}/billing`);
        };

        if (hasReachedLimit) {
          const notification = mauLimit({
            id: org.id,
            maxMaus,
            onActionClick: handleActionClick,
          });

          if (!hasDismissedNotification(org.id, notification.id)) {
            resp.push(notification);
          }
        } else if (isCloseToLimit) {
          const notification = mauLimitClose({
            id: org.id,
            maxMaus,
            totalMaus,
            onActionClick: handleActionClick,
          });

          if (!hasDismissedNotification(org.id, notification.id)) {
            resp.push(notification);
          }
        }
      }

      if (!org.bypassBetaUserLimit) {
        for (const project of totalUsersByProject ?? []) {
          const totalBetaUsers = project?.lowerEnvCount ?? 0;
          const maxBetaUsers = plan?.maxBetaUsers ?? 0;
          const hasReachedLimit = totalBetaUsers >= maxBetaUsers;
          const isCloseToLimit = totalBetaUsers >= maxBetaUsers - 10;

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
    }

    return resp;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasDismissedNotification,
    dismissedNotifications,
    org,
    plan?.maxBetaUsers,
    totalUsersByProject,
    monthlyActiveUsers,
    plan?.maxProdMAUs,
    plan?.slug,
  ]);

  return notifications;
};
