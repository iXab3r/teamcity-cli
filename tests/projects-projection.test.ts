import { projectionAcceptance } from "./projection-support.js";
import { cases } from "./projects-projection-cases.js";
projectionAcceptance("US-023", cases, {native: 1, paging: 2, mutation: 1, parity: 3, denied: 4, error: 5, blank: 6});
