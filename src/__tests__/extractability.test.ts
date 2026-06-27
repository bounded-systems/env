import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { DEFAULT_AMBIENT_RULES, assertSeam } from "@bounded-systems/seam-check";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// @bounded-systems/env is a zero-import leaf and the ONE sanctioned reader of
// process.env. Every other package forbids raw process.env so ambient config
// becomes an explicit @bounded-systems/env import edge.
test("@bounded-systems/env upholds its seam claim (zero-dependency leaf)", () => {
  assertSeam({
    root: SRC,
    prod: [],
    test: ["@bounded-systems/env", "@bounded-systems/seam-check", "node:fs"],
    // env IS the sanctioned reader of process.env, so that one ambient rule does
    // not apply here — but it still must never spawn a subprocess.
    forbidAmbient: DEFAULT_AMBIENT_RULES.filter(([, label]) => label !== "ambient env / auth"),
  });
});

test("is the sole sanctioned reader of process.env", () => {
  // Sanity: the capability does read process.env (that's its whole job).
  const src = readFileSync(join(SRC, "index.ts"), "utf8");
  expect(src.includes("process.env")).toBe(true);
});
