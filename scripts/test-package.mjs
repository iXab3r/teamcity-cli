// An explicit registry-install check, separate from the offline service test suite.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const npmCli = process.env.npm_execpath;
assert.ok(npmCli, "Run this check through npm run test:package.");
// `--registry <version>` (npm run test:registry) installs that published version instead of this checkout.
const supplied = process.argv.includes("--tarball") ? process.argv[process.argv.indexOf("--tarball") + 1] : undefined;
const registryVersion = process.argv.includes("--registry") ? process.argv[process.argv.indexOf("--registry") + 1] : undefined;
assert.ok(!process.argv.includes("--registry") || /^\d+\.\d+\.\d+/.test(registryVersion ?? ""), "Pass --registry <version>.");
const packages = [{ directory: ".", name: "@eyeauras/teamcity-cli", bin: "teamcity-cli", factory: "createTeamCityCli" }];
const temporary = await realpath(await mkdtemp(join(tmpdir(), "cli-factory-packages-")));
const prefix = join(temporary, "global");
const working = join(temporary, "working");
const archives = join(temporary, "archives");
const windows = process.platform === "win32";
const modules = join(prefix, ...(windows ? [] : ["lib"]), "node_modules");
const bins = windows ? prefix : join(prefix, "bin");
const environment = { ...process.env };
// Never pass npm credentials or caller-controlled Node loaders into the smoke commands.
for (const key of Object.keys(environment)) {
  if (/^(?:npm_config_|.*token.*$|.*secret.*$|.*password.*$|node_options$|node_path$|teamcity_token$|youtrack_token$)/i.test(key)) {
    delete environment[key];
  }
}
const pathKey = Object.keys(environment).find((key) => key.toLowerCase() === "path") ?? "PATH";
environment[pathKey] = bins + delimiter + (environment[pathKey] ?? "");

function run(executable, argv, { cwd = working, input, timeout = 30_000 } = {}) {
  const result = spawnSync(executable, argv, {
    cwd, input, env: environment, encoding: "utf8", timeout,
    maxBuffer: 4 * 1024 * 1024, windowsHide: true,
  });
  // npm failures may contain registry/user configuration; do not echo captured streams.
  const npmError = /npm error code ([A-Z0-9]+)/.exec(result.stderr ?? "")?.[1];
  assert.ok(!result.error && result.status === 0,
    `Package check failed (${executable === process.execPath ? "node/npm" : "installed command"}, status ${result.status}, ${result.error?.code ?? npmError ?? "no process error"}).`);
  return result.stdout;
}

function npm(argv, options) {
  return run(process.execPath, [npmCli, ...argv,
    "--cache", join(temporary, "cache"),
    "--userconfig", join(temporary, "npmrc"),
    "--globalconfig", join(temporary, "npmrc-global"),
    "--registry", "https://registry.npmjs.org/",
  ], options);
}

function command(name, argv, input) {
  // Fixed command names/arguments only. Windows must execute npm's actual .cmd shim.
  return windows
    ? run(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", `${name}.cmd ${argv.join(" ")}`], { input })
    : run(join(bins, name), argv, { input });
}

async function closedReader(name, argv, input = "") {
  const child = windows
    ? spawn(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", `${name}.cmd ${argv.join(" ")}`], { cwd: working, env: environment })
    : spawn(join(bins, name), argv, { cwd: working, env: environment });
  let stderr = "";
  child.stderr.setEncoding("utf8").on("data", chunk => { stderr += chunk; });
  const timer = setTimeout(() => child.kill(), 10_000);
  try {
    const completed = new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("close", (code, signal) => resolve({ code, signal }));
    });
    // Close before the installed executable starts writing, independently of help size.
    child.stdout.destroy();
    child.stdin.end(input);
    assert.deepEqual(await completed, { code: 141, signal: null }, `${name}: closed-reader exit`);
    assert.equal(stderr, "", `${name}: closed-reader diagnostics`);
  } finally { clearTimeout(timer); }
}

try {
  await Promise.all([mkdir(working), mkdir(archives),
    writeFile(join(temporary, "npmrc"), ""), writeFile(join(temporary, "npmrc-global"), "")]);
  const license = await readFile(join(root, "LICENSE"), "utf8");
  const tarballs = [];
  for (const entry of registryVersion === undefined ? packages : []) {
    const manifest = JSON.parse(await readFile(join(root, entry.directory, "package.json"), "utf8"));
    assert.equal(manifest.name, entry.name);
    assert.notEqual(manifest.private, true);
    assert.equal(manifest.license, "MIT");
    assert.equal(manifest.publishConfig.access, "public");
    assert.equal(await readFile(join(root, entry.directory, "LICENSE"), "utf8"), license);
    if (entry.bin) assert.deepEqual(manifest.bin, { [entry.bin]: "dist/src/bin.js" });
    const [packed] = JSON.parse(npm([
      "pack", ...(supplied ? [supplied, "--dry-run"] : []), "--json", "--ignore-scripts",
      "--pack-destination", archives,
    ], { cwd: root }));
    const files = new Set(packed.files.map((file) => file.path));
    for (const file of ["package.json", "README.md", "LICENSE", "dist/src/index.js", "dist/src/index.d.ts"]) {
      assert.ok(files.has(file), `${entry.name}: missing ${file}`);
    }
    for (const file of files) {
      assert.ok(["package.json", "README.md", "LICENSE"].includes(file) ||
        /^dist\/src\/[\w-]+\.(?:js|d\.ts)(?:\.map)?$/.test(file),
      `${entry.name}: unexpected archive member ${file}`);
    }
    if (entry.bin) assert.ok(files.has("dist/src/bin.js"));
    tarballs.push(supplied ?? join(archives, packed.filename));
    console.log(`${entry.name}: ${files.size} package files checked`);
  }

  // Install this exact product tarball with its exact independently published Core dependency.
  const install = registryVersion === undefined ? tarballs : packages.map((entry) => `${entry.name}@${registryVersion}`);
  npm(["install", "--global", "--prefix", prefix, "--no-audit", "--no-fund", ...install], { timeout: 180_000 });
  for (const entry of packages) {
    const installed = join(modules, ...entry.name.split("/"));
    assert.equal(await realpath(installed), installed, "Installed package must not be a workspace symlink.");
    const manifest = JSON.parse(await readFile(join(installed, "package.json"), "utf8"));
    assert.equal(manifest.name, entry.name);
    if (registryVersion !== undefined) assert.equal(manifest.version, registryVersion);
    const coreUrl = JSON.parse(run(process.execPath, ["--input-type=module", "--eval", `
      for (const suffix of ["", "/testing", "/proof"]) await import("@eyeauras/cli-factory" + suffix);
      console.log(JSON.stringify(import.meta.resolve("@eyeauras/cli-factory")));
    `], { cwd: installed }));
    const core = await realpath(fileURLToPath(coreUrl));
    assert.ok(!relative(await realpath(prefix), core).startsWith(".."), "Core must resolve inside the isolated prefix.");
    const installedCore = JSON.parse(await readFile(new URL("./package.json", new URL("../../", coreUrl)), "utf8"));
    assert.equal(installedCore.version, manifest.dependencies["@eyeauras/cli-factory"]);
    assert.match(manifest.dependencies["@eyeauras/cli-factory"], /^\d+\.\d+\.\d+$/);
    run(process.execPath, ["--input-type=module", "--eval", await readFile(join(root, "scripts/installed-contract.mjs"), "utf8")], { cwd: installed });
    const help = command(entry.bin, ["--help"]);
    assert.ok(help.includes(`Usage: ${entry.bin}`));
    assert.equal(command(entry.bin, ["--version"]).trim(), manifest.version);
    {
      await closedReader(entry.bin, ["--help"]);
      await closedReader(entry.bin, ["--json-rpc"], JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "cli.execute", params: { argv: ["--help"] },
      }) + "\n");
      if (!windows) {
        // Shell startup may rewrite PATH; keep the pipe on this installed shim and Node.
        const pipeline = spawnSync("bash", ["-o", "pipefail", "-c", 'PATH="$2" "$1" --help | head -n 1', "installed-cli", join(bins, entry.bin), environment[pathKey]], {
          cwd: working, env: environment, encoding: "utf8", timeout: 10_000,
        });
        assert.equal(pipeline.error, undefined);
        assert.equal(pipeline.signal, null);
        assert.ok([0, 141].includes(pipeline.status));
        assert.match(pipeline.stdout, new RegExp(`^Usage: ${entry.bin}`));
        assert.equal(pipeline.stderr, "");
      }
      console.log(`${entry.bin}: installed closed-reader help/RPC and shell pipeline passed`);
    }
    // Root/help output is intentionally human text even with --json. Exercise a real
    // JSON leaf through installed exports with synthetic AppData, never the user's profile.
    run(process.execPath, ["--input-type=module", "--eval", `
      import test from "node:test";
      import assert from "node:assert/strict";
      import { createCliFixture } from "@eyeauras/cli-factory/testing";
      import { ${entry.factory} as createApp } from ${JSON.stringify(entry.name)};
      test("installed JSON command with synthetic profile", async t => {
        const fixture = await createCliFixture(t, { applicationId: ${JSON.stringify(entry.bin)} });
        const app = fixture.createApplication(runtime => createApp(runtime));
        const profiles = await fixture.json(app, ["profile", "list"]);
        assert.equal(profiles.length, 1);
        assert.equal(profiles[0].name, "default");
        assert.equal(profiles[0].default, true);
      });
    `], { cwd: installed });
    {
      run(process.execPath, ["--input-type=module", "--eval", `
        import test from "node:test";
        import assert from "node:assert/strict";
        import { mkdir, readFile, access, writeFile } from "node:fs/promises";
        import { join } from "node:path";
        import { createCliFixture } from "@eyeauras/cli-factory/testing";
        import { ${entry.factory} as createApp } from ${JSON.stringify(entry.name)};
        test("installed downloads use invocation cwd in CLI and RPC", async t => {
          const fixture = await createCliFixture(t, {
            applicationId: ${JSON.stringify(entry.bin)},
            profiles: ["default", "other"].map(name => ({ name, values: { url: "https://service.example.test" }, secrets: { token: "synthetic-package-token" } })),
          });
          fixture.runtime.fetch = async (url, init) => {
            const path = new URL(String(url)).pathname;
            if (path === "/app/rest/builds/id:7/sources/files/fixture.txt") return new Response("synthetic-package-bytes");
            throw new Error("Unexpected offline package request: " + path);
          };
          const app = fixture.createApplication(createApp);
          const argv = ["builds", "source", "7", "fixture.txt"];
          const legacy = join(fixture.appArguments.AppDataDirectory, "downloads");
          await mkdir(legacy, { recursive: true });
          await writeFile(join(legacy, "old.txt"), "retained");
          await mkdir(join(fixture.root, "nested"));
          for (const output of [undefined, "nested/relative.txt", join(fixture.root, "absolute.txt")]) {
            const result = await fixture.json(app, [...argv, "--profile", "other", ...(output ? ["--output", output] : [])]);
            assert.equal(result.path, output ? (output.startsWith("/") || /^[A-Za-z]:/.test(output) ? output : join(fixture.root, output)) : join(fixture.root, "fixture.txt"));
            assert.equal(await readFile(result.path, "utf8"), "synthetic-package-bytes");
          }
          const replies = await fixture.rpc(app, [[...argv, "--profile", "default"], [...argv, "--profile", "other", "--output", "rpc.txt"]]);
          assert.match(replies[0].error.message, /exists/);
          assert.equal(replies[1].result.path, join(fixture.root, "rpc.txt"));
          assert.equal(await readFile(join(legacy, "old.txt"), "utf8"), "retained");
          const missing = await fixture.run(app, [...argv, "--output", "missing/file.txt"]);
          assert.equal(missing.exitCode, 1);
          await assert.rejects(access(join(fixture.root, "missing")));
          const removed = await fixture.run(app, ["downloads", "clean"]);
          assert.equal(removed.exitCode, 1);
        });
      `], { cwd: installed });
      console.log(`${entry.bin}: installed offline cwd, paths, profile/RPC and legacy retention passed`);
    }
    const requests = [1, 2].map((id) => JSON.stringify({
      jsonrpc: "2.0", id, method: "cli.execute", params: { argv: ["--help"] },
    })).join("\n") + "\n";
    const frames = command(entry.bin, ["--json-rpc"], requests).trim().split("\n").map((line) => JSON.parse(line));
    assert.equal(frames.length, 2);
    for (const [index, frame] of frames.entries()) {
      assert.equal(frame.jsonrpc, "2.0");
      assert.equal(frame.id, index + 1);
      assert.ok(frame.result.help.includes(`Usage: ${entry.bin}`));
    }
    console.log(`${entry.bin}: installed executable, version, JSON and persistent RPC passed`);
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
