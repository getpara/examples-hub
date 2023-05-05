export function getMailtoLink(email, recoveryShare) {
  const emailBody = 
  `Hello,%0D%0DBelow is your Capsule Recovery Phrase. Keep this safe!%0D%0D${recoveryShare}%0D%0DPlease get in touch via support@usecapsule.com if you have any questions`

  const mailText=`mailto:${email}?subject=Capsule%20Recovery%20Phrase&body=${emailBody}`
  return mailText;
}
