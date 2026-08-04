import { CardEffectRegistry, resolveEffectTarget } from "./CardEffectRegistry";
import { DEPTH_MAX } from "../../config/Constants";

CardEffectRegistry.register(
  "depthChange",
  (effect, ctx) => {
    resolveEffectTarget(effect.target, ctx).changeDepth(effect.amount);
  },
  (effect, ctx) => {
    // 회복 효과는 대상이 이미 최대 수심이면 사용할 수 없다 (피해 효과는 항상 허용)
    if (effect.amount <= 0) return true;
    return resolveEffectTarget(effect.target, ctx).getDepth() < DEPTH_MAX;
  }
);
