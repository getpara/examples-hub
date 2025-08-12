export function openPopup({
  url,
  target,
  type,
  current,
}: {
  url: string;
  target: string;
  type: 'OAUTH' | 'LOGIN_PASSKEY' | 'CREATE_PASSKEY' | 'TRANSACTION_REVIEW' | 'CREATE_PASSWORD' | 'LOGIN_PASSWORD';
  current?: Window | null;
}): Window | null {
  if (typeof window === 'undefined') {
    return null;
  }

  current?.close();

  const popUpWidth = 560;
  let popUpHeight: number;

  switch (type) {
    case 'LOGIN_PASSWORD': {
      popUpHeight = 798;
      break;
    }
    case 'LOGIN_PASSKEY': {
      popUpHeight = 798;
      break;
    }
    case 'CREATE_PASSWORD': {
      popUpHeight = 400;
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

  let popupWindow = window.open(url, target, windowFeatures);
  if (!popupWindow) {
    setTimeout(() => {
      popupWindow = window.open(url, '_blank');
    }, 0);
  }

  return popupWindow ?? null;
}
