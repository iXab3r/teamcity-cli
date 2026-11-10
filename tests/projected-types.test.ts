import type { TeamCityClient } from "../src/client.js";
import type { TeamCityBuild } from "../src/models.js";

// Compiled by the ordinary test build; never executes a service request.
async function projectionTypes(client: TeamCityClient) {
  const build: TeamCityBuild = await client.getBuild(42);
  build.id.toFixed();
  // @ts-expect-error Arbitrary native JSON does not promise the default build shape.
  (await client.getBuild(42, "number")).id.toFixed();
  const status = await client.setBuildStatus(42, "SUCCESS", "Fixture");
  status.errorCount.toFixed();
  // @ts-expect-error A native status projection has no synthesized errorCount.
  (await client.setBuildStatus(42, "SUCCESS", "Fixture", "build(id)")).errorCount.toFixed();
  (await client.listBuilds()).items[0]?.id.toFixed();
  // @ts-expect-error Native list items need validation before shaped property access.
  (await client.listBuilds({ fields: "number" })).items[0]?.id.toFixed();
  (await client.cancelBuild(42)).id.toFixed();
  // @ts-expect-error Projected cancellation is native JSON too.
  (await client.cancelBuild(42, { fields: "number" })).id.toFixed();
}
void projectionTypes;
