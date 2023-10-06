/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  coverageReporters: ["text", "html"],
  coverageDirectory: "<rootDir>/coverage/",
  setupFilesAfterEnv: ["./shared/partipro-shared/__tests__/global.ts"],
  setupFiles: ["./shared/partipro-shared/__tests__/setupEnvs.ts"],
  testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
};
