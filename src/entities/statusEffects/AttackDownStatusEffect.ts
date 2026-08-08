import { StatusEffectRegistry } from "./StatusEffectRegistry";

StatusEffectRegistry.register("attackDown", {
  modifyOutgoingDamage: (amount, effect) => Math.max(0, amount - effect.amount),
});
