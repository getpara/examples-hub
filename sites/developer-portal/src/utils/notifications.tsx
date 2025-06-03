import { Typography } from '@getpara/react-component-library';
import { ReactElement } from 'react';

export type NotificationType = 'info' | 'warning' | 'error';

export type Notification = {
  id: string;
  title: string | ReactElement;
  message: string | ReactElement;
  type: NotificationType;
};

export const betaUserLimit = ({
  id,
  projectName,
  maxBetaUsers,
}: {
  id: string;
  projectName: string;
  maxBetaUsers: number;
}): Notification => ({
  id: `${id}-beta-user-limit`,
  title: `Development User Limit Reached for ${projectName}`,
  message: (
    <Typography>{`You have reached the limit of ${maxBetaUsers} Development users for your project. Please remove some users to continue using the Development environment.`}</Typography>
  ),
  type: 'warning',
});

export const betaUserLimitClose = ({
  id,
  projectName,
  maxBetaUsers,
  totalBetaUsers,
}: {
  id: string;
  projectName: string;
  maxBetaUsers: number;
  totalBetaUsers: number;
}): Notification => ({
  id: `${id}-beta-user-limit-close`,
  title: `You're Nearing the User Limit for ${projectName}`,
  message: (
    <Typography>
      Before launching your app, create a PRODUCTION key.{' '}
      <strong>{`You have used ${totalBetaUsers}/${maxBetaUsers} Development users.`}</strong>
    </Typography>
  ),
  type: 'warning',
});
