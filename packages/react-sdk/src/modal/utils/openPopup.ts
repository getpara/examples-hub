export function openPopup(
  popupUrl: string,
  target: string,
  type: 'OAUTH' | 'LOGIN_PASSKEY' | 'CREATE_PASSKEY' | 'TRANSACTION_REVIEW',
): Window {
  const popUpWidth = 550;
  let popUpHeight: number;

  switch (type) {
    case 'LOGIN_PASSKEY': {
      popUpHeight = 798;
      break;
    }
    case 'CREATE_PASSKEY': {
      popUpHeight = 464;
      break;
    }
    case 'TRANSACTION_REVIEW': {
      popUpHeight = 480;
      break;
    }
    case 'OAUTH':
    default: {
      popUpHeight = 768;
      break;
    }
  }

  // Fixes position when using multiple monitors
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

  const width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : screen.width;
  const height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : screen.height;

  const left = (width - popUpWidth) / 2 + dualScreenLeft;
  const top = (height - popUpHeight) / 2 + dualScreenTop;

  const windowFeatures = `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${top}, left=${left}`;

  let popupWindow = window.open(popupUrl, target, windowFeatures);
  if (!popupWindow) {
    setTimeout(() => {
      popupWindow = window.open(popupUrl, '_blank');
    }, 0);
  }

  return popupWindow;
}
