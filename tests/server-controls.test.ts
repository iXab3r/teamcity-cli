import { nativeControlsAcceptance } from "./projection-support.js";

const query = {
  fileName: "nightly",
};
const switches = [
  "add-timestamp", "include-configs", "include-database", "include-build-logs",
  "include-personal-changes", "include-running-builds", "include-supplementary-data",
];
nativeControlsAcceptance("US-034", [
  ...["list", "children", "archive"].map(action => ({
    argv: ["server", "files", action, "logs", ...(action === "list" ? [] : ["src"])],
    permission: "ReadOnly",
    archive: action === "archive",
    query: {
      locator: "count:100",
      ...(action === "archive" ? {} : {fields: "count,file(name,size,modificationTime)"}),
    },
    controls: {
      "base-path": " /src + ",
      ...(action === "archive" ? {"archive-name": "source +.zip"} : {}),
    },
  })),
  ...switches.flatMap(key => ["true", "false"].map(value => ({
  argv: ["server", "backup", "start", "nightly", "--confirm"],
  permission: "Admin",
  backup: true,
  query,
  controls: {[key]: value},
  boolean: key,
}))),
], {native: 1, parity: 3, blank: 6});
