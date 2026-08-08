import { CardEffectRegistry, resolveEffectTarget } from "./CardEffectRegistry";

CardEffectRegistry.register("damage", (effect, ctx) => {
  const amount = ctx.source.getOutgoingDamageModifier(effect.amount);
  resolveEffectTarget(effect.target, ctx).applyDamage(amount);
});
