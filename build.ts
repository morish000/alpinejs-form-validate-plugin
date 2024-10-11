import { build, type Plugin, stop } from "esbuild";

const processCache = async (entryPoints: string[]) => {
  const command = new Deno.Command("deno", {
    args: ["cache", ...entryPoints],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await command.output();

  const decoder = new TextDecoder();

  if (code !== 0) {
    console.error(decoder.decode(stderr));
    Deno.exit(code);
  }

  console.log(decoder.decode(stdout));
};

const denoCachePlugin = (entryPoints: string[]): Plugin => ({
  name: "deno-cache-plugin",
  setup(build: { onStart: (arg0: () => Promise<void>) => void }) {
    build.onStart(async () => {
      await processCache(entryPoints);
    });
  },
});

const entryPoints: string[] = [
  `src/mod.ts`,
  `src/functions/index.ts`,
  `src/i18next/alpinejs_i18next_plugin.ts`,
  `src/i18next/i18next_message_resolver.ts`,
];

await build({
  entryPoints,
  outdir: "dist",
  format: "esm",
  bundle: true,
  minify: true,
  sourcemap: true,
  resolveExtensions: [".ts"],
  outExtension: {
    ".js": ".mjs"
  },
  plugins: [denoCachePlugin(entryPoints)],
});

stop();
