import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";

export default [
  {
    input: "src/index.ts",
    output: [
      { file: "dist/index.mjs", format: "esm", sourcemap: true },
      { file: "dist/index.cjs", format: "cjs", sourcemap: true }
    ],
    external: ["fs", "path"],
    plugins: [
      nodeResolve(),
      commonjs({
        dynamicRequireTargets: [
          "node_modules/mime/dist/src/index.js"
        ]
      }),
      json(),
      typescript(),
    ],
  },
  // CLI
  {
    input: "src/cli.ts",
    output: [
      { file: "dist/cli.mjs", format: "esm", sourcemap: true, banner: "#!/usr/bin/env node" },
      { file: "dist/cli.cjs", format: "cjs", sourcemap: true, banner: "#!/usr/bin/env node" }
    ],
    external: ["fs", "path"],
    plugins: [
      nodeResolve(),
      commonjs({
        dynamicRequireTargets: [
          "node_modules/mime/dist/src/index.js"
        ]
      }),
      json(),
      typescript(),
    ],
  },
  {
    input: "src/index.ts",
    output: { file: "dist/index.d.ts", format: "es" },
    plugins: [dts({
      respectExternal: true,
      compilerOptions: {
        baseUrl: "./src",
        paths: {
          "@/*": ["./*"]  // ⬅ Переконуємося, що Rollup правильно замінює шляхи
        },
        preserveSymlinks: false,
      },
    })]
  }
];
