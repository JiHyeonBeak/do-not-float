import { CardEffectRegistry } from "./CardEffectRegistry";

CardEffectRegistry.register("cancelNextEnemyAction", (_effect, ctx) => {
  ctx.target.addStatusEffect({ type: "stunned", amount: 0, remainingTurns: 1 });
});
