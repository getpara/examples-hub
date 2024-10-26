export const getDeviceModelName = (model?: string) => {
  if (!model) {
    return undefined;
  }

  switch (model.toLowerCase()) {
    case 'macintosh': {
      return 'Mac';
    }
    default: {
      return model;
    }
  }
};
