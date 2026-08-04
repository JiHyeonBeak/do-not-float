import { CardEffectRegistry, resolveEffectTarget } from "./CardEffectRegistry";

CardEffectRegistry.register("damage", (effect, ctx) => {
  resolveEffectTarget(effect.target, ctx).applyDamage(effect.amount);
});
