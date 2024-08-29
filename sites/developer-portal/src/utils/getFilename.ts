export const getFilename = (uri: string) => {
  const decodedSplit = decodeURI(uri).split('/');
  return decodedSplit[decodedSplit.length - 1];
};
