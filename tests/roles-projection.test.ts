import { projectionAcceptance } from "./projection-support.js";
import { cases } from "./roles-projection-cases.js";

projectionAcceptance("US-031", cases, {
  native: 1, paging: 1, mutation: 2, parity: 3, denied: 4, error: 5, blank: 6,
});
