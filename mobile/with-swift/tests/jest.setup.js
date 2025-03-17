// Increase timeout for all tests
jest.setTimeout(30000);

// Suppress console.error during tests
console.error = jest.fn(); 