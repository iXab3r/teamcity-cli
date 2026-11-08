// Local instruction completeness check. Standard library only; never reads the network.
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname, relative, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const functions = ["cli-writer", "gh-issue-dev", "reconciliation-lead", "reviewer", "story-delivery-lead"];
const practices = ["github-issues", "independent-review", "integration-authoring-reviews", "story-driven-delivery", "workstreams"];
const templates = ["bug-report.md", "config.yml", "feature-design.md"];
const read = path => readFileSync(resolve(root, path), "utf8");
function exact(directory, expected) {
  assert.deepEqual(readdirSync(resolve(root, directory)).sort(), [...expected].sort(), `${directory}: missing or unexpected setup item`);
}
exact(".claude/agents", functions.map(x => `${x}.md`));
exact("docs/practices", practices.map(x => `${x}.md`));
exact("docs/roles", [...functions.map(x => `${x}.md`), "README.md", "integration-author.md", "core-escalation.md"]);
exact(".github/ISSUE_TEMPLATE", templates);
assert(/^labels: bug$/m.test(read(".github/ISSUE_TEMPLATE/bug-report.md")) && /^labels: enhancement$/m.test(read(".github/ISSUE_TEMPLATE/feature-design.md")), "Issue form labels must preserve supported intake metadata");
assert(/^blank_issues_enabled: true\s*\ncontact_links: \[\]\s*$/.test(read(".github/ISSUE_TEMPLATE/config.yml")), "Issue chooser must preserve blank intake and absence of external contacts");
assert(!existsSync(resolve(root, "CLAUDE.md")), "Duplicate CLAUDE.md policy surface is not part of this setup");
const required = ["AGENTS.md", "README.md", "docs/agent-setup.md", "docs/roles/README.md",
  "docs/universal-laws.md", "docs/DESIGN.md", "docs/testing.md", "docs/integrations.md", "docs/content-limits.md",
  "docs/policy-provenance.md", "docs/product-contract.md", "docs/release.md", "docs/roles/integration-author.md",
  "docs/roles/core-escalation.md", "integration-tests/profile-proof.ts", "scripts/check-agent-setup.mjs",
  ...functions.map(x => `docs/roles/${x}.md`), ...functions.map(x => `.claude/agents/${x}.md`),
  ...practices.map(x => `docs/practices/${x}.md`), ...templates.map(x => `.github/ISSUE_TEMPLATE/${x}`)];
const packageName = JSON.parse(read("package.json")).name;
assert(["@eyeauras/teamcity-cli", "@eyeauras/youtrack-cli"].includes(packageName), "Unexpected product");
if (packageName === "@eyeauras/youtrack-cli") required.push("docs/agent-workflow.md");
for (const file of required) assert(existsSync(resolve(root, file)), `Missing expected required file: ${file}`);
assert.deepEqual([...read("docs/universal-laws.md").matchAll(/^(\d+)\. \*\*/gm)].map(x => +x[1]), Array.from({length:17}, (_,i)=>i+1), "All 17 universal laws must be present");
for (const name of functions) {
  const adapter = read(`.claude/agents/${name}.md`), front = adapter.split("---")[1];
  assert(front?.includes(`name: ${name}\n`) && front.includes("model: inherit"), `${name}: adapter metadata`);
  assert(adapter.includes(`../../docs/roles/${name}.md`) && adapter.includes("../../docs/roles/integration-author.md"), `${name}: local role/domain routing`);
  if (name === "reviewer") assert(!/\b(Edit|Write)\b/.test(front), "Reviewer must stay read-only");
}
function prose(text) {
  let fence = null;
  return text.split(/\r?\n/).map(line => {
    const match = /^\s*(`{3,}|~{3,})/.exec(line);
    if (match) { if (!fence) fence=match[1][0]; else if (fence===match[1][0]) fence=null; return ""; }
    return fence ? "" : line;
  }).join("\n");
}
function headings(text) {
  const result = new Set(), counts = new Map();
  for (const line of prose(text).split("\n")) {
    const match = /^#{1,6}\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;
    const slug=match[1].replace(/\[([^\]]+)\]\([^)]*\)/g,"$1").replace(/<[^>]*>/g, "")
      .toLowerCase().replace(/[^\p{L}\p{N}_ -]/gu, "").replace(/ /g, "-");
    const n=counts.get(slug)??0; counts.set(slug,n+1); result.add(slug+(n?`-${n}`:""));
  }
  for (const match of text.matchAll(/<a\s+(?:id|name)=["']([^"']+)["']/g)) result.add(match[1]);
  return result;
}
function links(text) {
  const result=[]; text=prose(text);
  // Balanced destinations admit ordinary Markdown paths and heading fragments.
  const pattern=/!?\[([^\]\n]+)\]\((<[^>]+>|(?:\\.|[^()\s]|\([^()]*\))+)(?:\s+"[^"\n]*")?\)/g;
  for (const match of text.matchAll(pattern)) result.push({label:match[1],target:match[2].replace(/^<|>$/g,"")});
  // Parent issue-template comments use plain root-relative required paths.
  for (const file of ["AGENTS.md", "docs/agent-setup.md"])
    if (text.includes(file)) result.push({label:"plain required path",target:"/"+file});
  return result;
}
const seen = new Set(), edges=[], external=[];
// AGENTS must reach every expected policy/adapter/form itself; extra entry roots must not hide omissions.
const queue=["AGENTS.md"];
while (queue.length) {
  const from=queue.shift(); if (seen.has(from)) continue; seen.add(from);
  if (![".md", ".yml"].includes(extname(from))) continue;
  const text=read(from);
  assert(!/canonical policy stays in Factory|polic(?:y|ies) (?:stay|stays|remain|remains) in Factory|no policy copies|do not copy (?:shared |agent )?polic(?:y|ies)|instruction links aligned with.*dependenc/i.test(text), `${from}: obsolete remote-policy ownership`);
  for (const link of links(text)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(link.target)) {
      assert(/^https?:\/\//.test(link.target) && /^optional (provenance|API reference|tracker reference|source reference): /i.test(link.label), `${from}: external link must be explicitly optional, never required policy (${link.label})`);
      assert(from === "docs/policy-provenance.md" || !/EyeAuras\.CliFactory\/blob\/[^/]+\/(?:AGENTS\.md|docs\/(?:roles|practices)\/|integrations\/AGENTS\.md|packages\/core\/AGENTS\.md)/i.test(link.target), `${from}: role/domain policy cannot be outsourced even under an optional label`);
      external.push({from,...link}); continue;
    }
    const [raw, fragment=""] = link.target.split("#");
    const absolute = raw ? resolve(raw.startsWith("/")?root:dirname(resolve(root,from)), decodeURIComponent(raw.replace(/^\//,""))) : resolve(root,from);
    assert(absolute===root || absolute.startsWith(root+sep), `${from}: link escapes repository`);
    assert(existsSync(absolute), `${from}: missing local target ${link.target}`);
    const to=relative(root,absolute).split(sep).join("/");
    if (fragment && extname(to)===".md") assert(headings(read(to)).has(decodeURIComponent(fragment)), `${from}: missing heading ${link.target}`);
    edges.push({from,to,fragment}); if ([".md",".yml"].includes(extname(to))) queue.push(to); else seen.add(to);
  }
}
for (const file of required) assert(seen.has(file), `Expected instruction surface unreachable from AGENTS: ${file}`);
const routeSet=new Set(edges.map(x=>`${x.from} -> ${x.to}`));
const requireRoute=(from,to)=>assert(routeSet.has(`${from} -> ${to}`), `${from}: required local route missing: ${to}`);
for(const name of functions){
 requireRoute("AGENTS.md", `docs/roles/${name}.md`);
 requireRoute(`.claude/agents/${name}.md`, `docs/roles/${name}.md`);
 requireRoute(`.claude/agents/${name}.md`, "docs/roles/integration-author.md");
}
for(const name of practices) requireRoute("AGENTS.md", `docs/practices/${name}.md`);
for(const file of ["docs/roles/integration-author.md","docs/roles/core-escalation.md","docs/roles/README.md","docs/universal-laws.md","docs/DESIGN.md","docs/testing.md","docs/integrations.md","docs/product-contract.md"])
 requireRoute("AGENTS.md",file);
requireRoute("docs/roles/README.md","docs/roles/integration-author.md");
requireRoute("docs/roles/README.md","docs/roles/core-escalation.md");
const result={status:"PASS",product:packageName,requiredFiles:required.length,reachableFiles:seen.size,localEdges:edges.length,
  externalRequiredPolicies:0,roles:functions,practices,templates,files:[...seen].sort(),edges,externalReferences:external};
if (process.argv.includes("--json")) console.log(JSON.stringify(result,null,2));
else console.log(`${packageName}: local agent setup PASS; ${required.length} expected files, ${seen.size} reachable files, ${edges.length} local links; 0 remote policy requirements.`);
