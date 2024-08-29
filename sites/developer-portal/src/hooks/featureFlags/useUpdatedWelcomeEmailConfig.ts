import { useGate } from 'statsig-react';

export const useUpdatedWelcomeEmailConfig = () => {
  const { value } = useGate('use_updated_welcome_emails');

  return value;
};
