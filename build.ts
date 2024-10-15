import { build, stop } from "esbuild";

await build({
  entryPoints: [
    "src/mod.ts",
    "src/alpinejs_form_validate_plugin.ts",
    "src/functions/index.ts",
    "src/i18next/alpinejs_i18next_plugin.ts",
    "src/i18next/i18next_message_resolver.ts",
  ],
  outdir: "dist",
  format: "esm",
  bundle: true,
  minify: true,
  sourcemap: true,
  resolveExtensions: [".ts"],
  outExtension: {
    ".js": ".mjs",
  },
});

stop();
