export const randomTestEmail = ({ length = 12, domain = "test.usecapsule.com", includeNumbers = true } = {}) => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" + (includeNumbers ? "0123456789" : "");

  let result = Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");

  return `${result}@${domain}`;
};

export const randomTestPhone = ({
  validAreaCodes = [201, 202, 203, 205, 206, 207, 208, 209, 210, 212, 213, 214, 215, 216, 217, 218, 219, 220],
} = {}) => {
  const areaCode = validAreaCodes[Math.floor(Math.random() * validAreaCodes.length)];
  const exchange = "555";
  const subscriber = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `${areaCode}${exchange}${subscriber}`;
};

export const randomTestOTP = ({ length = 6, allowZeroStart = true } = {}) => {
  const getRandomDigit = () => Math.floor(Math.random() * 10);
  let otp = Array.from({ length }, (_, i) =>
    i === 0 && !allowZeroStart ? getRandomDigit() || 1 : getRandomDigit()
  ).join("");
  return otp;
};
