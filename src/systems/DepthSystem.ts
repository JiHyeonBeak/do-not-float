import { DEPTH_SAFE_THRESHOLD, DEPTH_DANGER_THRESHOLD, DEPTH_SURFACE } from "../config/Constants";

export type DepthState = "deep" | "safe" | "danger" | "surfaced";

export class DepthSystem {
  static getState(depth: number): DepthState {
    if (depth <= DEPTH_SURFACE) return "surfaced";
    if (depth <= DEPTH_DANGER_THRESHOLD) return "danger";
    if (depth <= DEPTH_SAFE_THRESHOLD) return "safe";
    return "deep";
  }
}
