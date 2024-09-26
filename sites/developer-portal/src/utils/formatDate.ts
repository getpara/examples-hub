import { format } from 'date-fns';

export const formatDate = (date: Date) => {
  return format(date, 'M/d/yyyy');
};

export const formatDateInUTC = (date: Date) => {
  const dt = new Date(date);

  return new Date(dt.valueOf() + dt.getTimezoneOffset() * 60 * 1000);
};
