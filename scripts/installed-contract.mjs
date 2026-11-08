// Executes from the installed product directory, resolving only installed package exports.
import test from "node:test";
import assert from "node:assert/strict";
import { createCliFixture } from "@eyeauras/cli-factory/testing";
import { createTeamCityCli, TeamCityClient } from "@eyeauras/teamcity-cli";
test("installed paging retains lookahead, sparse continuation, profiles and cancellation", async t => {
  const f = await createCliFixture(t, { applicationId: "teamcity-cli", profiles: ["default", "other"].map(name => ({ name,
    values: { url: `https://${name}.example.test/context` }, secrets: { token: `synthetic-${name}` },
  })) });
  let mode = "more";
  const calls = [];
  f.runtime.fetch = async (input, init) => {
    const url = new URL(input); const locator = url.searchParams.get("locator");
    assert.equal(url.pathname, "/context/app/rest/builds");
    const profile = url.hostname.split(".")[0];
    assert.equal(new Headers(init.headers).get("authorization"), `Bearer synthetic-${profile}`);
    calls.push(locator);
    if (mode === "sparse" && !locator.includes("lookupLimit:10000")) return Response.json({build: [], nextHref: "/context/app/rest/builds?locator=start:0,count:2,lookupLimit:10000"});
    return Response.json({ build: mode === "more" ? [{id:1, state:"finished",status:"SUCCESS"},{id:2,state:"finished",status:"SUCCESS"}] : [{id:1,state:"finished",status:"SUCCESS"}] });
  };
  const app = f.createApplication(createTeamCityCli);
  const argv = ["builds", "list", "--limit", "1"];
  assert.deepEqual(await f.json(app, argv), {count:1,items:[{id:1,state:"finished",status:"SUCCESS"}],hasMore:true,nextStart:1});
  const human = await f.run(app, argv); assert.equal(human.exitCode, 0); assert.match(human.stdout, /More results/);
  const frames = await f.rpc(app, [argv,[...argv,"--profile","other"]]);
  assert.deepEqual(frames[0].result, frames[1].result);
  mode = "sparse";calls.length = 0;
  assert.equal((await f.json(app, argv)).hasMore, false); assert.equal(calls.length, 2);assert.match(calls[1], /lookupLimit:10000/);
  const controller = new AbortController();let requests = 0;
  const client = new TeamCityClient({baseUrl:"https://cancel.example.test",token:"synthetic-cancel",signal:controller.signal,
    fetch:async () => { requests++;controller.abort(new Error("synthetic cancellation"));return Response.json({build:[],nextHref:"/app/rest/builds?locator=start:0,count:2,lookupLimit:10000"}); }});
  await assert.rejects(client.listBuilds({limit:1}));assert.equal(requests, 1);
  const before = calls.length;
  const rejected = await f.run(app,["builds","list","--limit","-1"]);assert.equal(rejected.exitCode, 1);assert.equal(calls.length,before);
});
