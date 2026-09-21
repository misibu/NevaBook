import { cp, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules", "libraw-wasm", "dist");
const target = join(root, "public", "vendor", "libraw");

await mkdir(target, { recursive: true });

for (const file of ["index.js", "worker.js", "libraw.js", "libraw.wasm"]) {
  await cp(join(source, file), join(target, file));
}

console.log("LibRaw browser assets copied to public/vendor/libraw");
