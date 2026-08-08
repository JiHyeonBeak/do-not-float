import { CardEffectRegistry } from "./CardEffectRegistry";

// cancelNextEnemyAction과 마찬가지로 항상 상대(ctx.target)에게 적용되는 효과라 target 필드가 없다.
CardEffectRegistry.register("resetEnemyDivePower", (_effect, ctx) => {
  ctx.target.changeDivePower(-ctx.target.getDivePower());
});
