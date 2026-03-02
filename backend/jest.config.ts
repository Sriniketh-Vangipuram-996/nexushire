import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["**/tests/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  clearMocks: true,
  transform: {
  "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
},
};

export default config;