/* eslint-disable */
/**
 * Copies the freshly produced ./build directory into
 * ../Shopping_List_Backend/build, removing the old contents first
 * so stale hashed assets don't accumulate.
 *
 * Runs automatically after `npm run build` (see package.json).
 */
const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(PROJECT_ROOT, "build");
const TARGET = path.resolve(
  PROJECT_ROOT,
  "..",
  "Shopping_List_Backend",
  "build"
);

if (!fs.existsSync(SOURCE)) {
  console.error(
    `[sync-to-backend] ✗ Source build folder not found: ${SOURCE}`
  );
  process.exit(1);
}

console.log(`[sync-to-backend] → target: ${TARGET}`);

if (fs.existsSync(TARGET)) {
  console.log("[sync-to-backend] removing previous build…");
  fs.rmSync(TARGET, { recursive: true, force: true });
}

console.log("[sync-to-backend] copying new build…");
fs.cpSync(SOURCE, TARGET, { recursive: true });

console.log("[sync-to-backend] ✓ done");
