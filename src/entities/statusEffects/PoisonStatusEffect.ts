import { StatusEffectRegistry } from "./StatusEffectRegistry";

StatusEffectRegistry.register("poison", {
  onTurnStart: (character, effect) => {
    character.applyDamage(effect.amount);
  },
});
