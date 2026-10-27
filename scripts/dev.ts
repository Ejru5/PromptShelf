/**
 * `npm run dev`: rebuilds content on every change in content/ while Next's dev
 * server runs, so editing a prompt.md shows up on refresh.
 */
import { spawn, type ChildProcess } from "node:child_process";

const children: ChildProcess[] = [];
const start = (cmd: string, args: string[]) => {
  const child = spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  children.push(child);
  child.on("exit", (code) => {
    if (code && code !== 0) shutdown(code);
  });
  return child;
};

function shutdown(code = 0) {
  for (const c of children) if (!c.killed) c.kill("SIGTERM");
  process.exit(code);
}
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

start("npx", ["tsx", "scripts/content/build.ts", "--watch"]);
start("npx", ["next", "dev", ...process.argv.slice(2)]);
