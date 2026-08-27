import { defineConfig } from "vitest/config";

export default defineConfig({
  // Алиасы `@/...` из tsconfig — иначе тесты не видят модули, импортирующие друг друга.
  resolve: { tsconfigPaths: true },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
