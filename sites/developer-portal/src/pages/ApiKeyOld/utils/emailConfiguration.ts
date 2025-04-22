export enum EmailOption {
  WELCOME = 'welcome',
  WELCOME_AND_BACKUP = 'welcomeAndBackup',
  BACKUP = 'backup',
  NONE = 'none',
}

export const getEmailOption = (backupKit?: boolean, welcome?: boolean) => {
  if (!backupKit && !welcome) {
    return EmailOption.NONE;
  }
  if (backupKit && !welcome) {
    return EmailOption.BACKUP;
  }
  if (!backupKit && welcome) {
    return EmailOption.WELCOME;
  }
  if (backupKit && welcome) {
    return EmailOption.WELCOME_AND_BACKUP;
  }
};
