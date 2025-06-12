import { format } from 'date-fns';

export const formatDate = (date: Date) => {
  return format(date, 'M/d/yyyy');
};

export const formatDatetime = (date: Date) => {
  const abbreviatedTimeZone = new Intl.DateTimeFormat('en-US', {
    timeZoneName: 'short',
  })
    .formatToParts(new Date(date))
    .find(part => part.type === 'timeZoneName')?.value;

  return `${format(date, 'M/d/yyyy @ h:mmaaa')} ${abbreviatedTimeZone}`;
};

export const formatDateInUTC = (date: Date) => {
  const dt = new Date(date);

  return new Date(dt.valueOf() + dt.getTimezoneOffset() * 60 * 1000);
};
