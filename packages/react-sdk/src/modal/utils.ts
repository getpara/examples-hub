export function openPopup(popupUrl) {
  const width = 600, height = 600;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  const windowFeatures = `toolbar=no, menubar=no, width=${width}, height=${height}, top=${top}, left=${left}`;
  window.open(popupUrl, 'GoogleAuthPopup', windowFeatures);
}

// Captures 0x + 4 characters, then the last 4 characters.
const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;

export const truncateEthAddress = (address: string) => {
  const match = address.match(truncateRegex);
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

export const emptyFunction = () => {};
