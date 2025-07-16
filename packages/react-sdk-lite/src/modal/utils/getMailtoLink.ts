export function getMailtoLink(email, recoveryShare) {
  const emailBody = `Hello,%0D%0DBelow is your Para Recovery Secret. Keep this safe!%0D%0D${recoveryShare}%0D%0DPlease get in touch via support@getpara.com if you have any questions`;

  const mailText = `mailto:${email}?subject=Para%20Recovery%20Secret&body=${emailBody}`;
  return mailText;
}
