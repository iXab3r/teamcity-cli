import { projectionAcceptance } from "./projection-support.js";
import { cases } from "./versioned-settings-projection-cases.js";
projectionAcceptance("US-026", cases, {native:1,paging:1,mutation:2,parity:3,denied:4,error:5,blank:6});
