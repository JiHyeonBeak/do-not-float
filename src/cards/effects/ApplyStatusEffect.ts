import { CardEffectRegistry, resolveEffectTarget } from "./CardEffectRegistry";

CardEffectRegistry.register("statusEffect", (effect, ctx) => {
  resolveEffectTarget(effect.target, ctx).addStatusEffect({
    type: effect.status,
    amount: effect.amount,
    remainingTurns: effect.duration,
  });
});
