import { projectionAcceptance } from "./projection-support.js";
import { cases } from "./health-audit-projection-cases.js";

projectionAcceptance("US-033", cases, {
  native: 1, paging: 2, mutation: 2, parity: 3, denied: 4, error: 5, blank: 6,
});
