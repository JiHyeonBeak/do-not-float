import { CardEffectRegistry, resolveEffectTarget } from "./CardEffectRegistry";

CardEffectRegistry.register("shield", (effect, ctx) => {
  resolveEffectTarget(effect.target, ctx).changeDivePower(effect.amount);
});
