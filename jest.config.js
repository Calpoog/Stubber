module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/unit/setup.js'],
  moduleFileExtensions: ['js', 'jsx'],
  moduleDirectories: ['node_modules', '<rootDir>/src/assets/javascripts'],
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': '<rootDir>/babelJest.js',
  },
  testMatch: ['**/?(*.)+(spec|test).js'],
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/test/mocks/styleMock.js',
    '^.+\\.svg$': '<rootDir>/test/mocks/fileMock.js',
    '^url:(.*)+$': '$1',
  },
};
