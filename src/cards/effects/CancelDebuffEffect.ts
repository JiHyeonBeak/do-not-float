import { CardEffectRegistry } from "./CardEffectRegistry";

// 항상 카드를 낸 쪽(ctx.source) 자신의 상태이상을 제거하는 효과라 target 필드가 없다
// (cancelNextEnemyAction/resetEnemyDivePower와 같은 이유).
CardEffectRegistry.register(
  "cancelDebuff",
  (_effect, ctx) => {
    ctx.source.removeStrongestStatusEffect();
  },
  (_effect, ctx) => ctx.source.getStatusEffects().length > 0
);
