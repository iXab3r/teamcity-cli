import { nativeControlsAcceptance } from "./projection-support.js";
nativeControlsAcceptance("US-028", [
  ...["list","children","archive"].map(action => ({argv:["vcs","instances","files",action,"8",...(action === "list" ? [] : ["src"])],permission:"ReadOnly",archive:action === "archive",query:action === "archive" ? {locator:"count:100"} : {locator:"count:100",fields:"count,file(name,size,modificationTime)"},controls:{"base-path":" /src + ",...(action === "archive" ? {"archive-name":"source +.zip"} : {})}})),
  ...["true","false"].map(value => ({argv:["vcs","instances","notify-commit","8"],permission:"Update",query:{locator:"id:8"},controls:{"ok-on-nothing-found":value},boolean:"ok-on-nothing-found"})),
]);
