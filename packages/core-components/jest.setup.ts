global.MutationObserver = jest.fn(() => {
  return { observe: jest.fn(), disconnect: jest.fn(), takeRecords: jest.fn() };
});
