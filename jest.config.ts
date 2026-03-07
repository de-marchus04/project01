import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/auth$": "<rootDir>/src/__mocks__/auth-stub.js",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { module: "commonjs" } }],
  },
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
};

export default config;
