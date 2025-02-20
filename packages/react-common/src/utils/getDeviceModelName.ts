export const getDeviceModelName = (model?: string) => {
  if (!model) {
    return undefined;
  }

  switch (model.toLowerCase()) {
    case 'macintosh': {
      return 'Mac';
    }
    case 'k': {
      return 'Android';
    }
    default: {
      return model;
    }
  }
};
