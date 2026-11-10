import { projectionAcceptance } from "./projection-support.js";
import { cases } from "./job-rules-projection-cases.js";
projectionAcceptance("US-020", cases, {native: 1, mutation: 2, parity: 3, denied: 4, error: 5, blank: 6, paging: 1});
