// Test setup
jest.setTimeout(10000);

// Mock environment variables
(process.env as Record<string, string>).NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.BCRYPT_SALT_ROUNDS = '4'; // Lower for faster tests
