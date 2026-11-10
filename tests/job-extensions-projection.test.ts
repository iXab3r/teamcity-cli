import { projectionAcceptance } from "./projection-support.js";
import { cases } from "./job-extensions-projection-cases.js";
projectionAcceptance("US-019", cases, {native: 1, mutation: 2, parity: 3, denied: 4, error: 5, blank: 6, paging: 1});
