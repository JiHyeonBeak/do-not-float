import { CardEffect, EffectTarget } from "../cards/Card";
import { STATUS_EFFECT_LABELS } from "./formatStatusEffects";

function targetLabel(target: EffectTarget): string {
  return target === "self" ? "자신" : "상대";
}

function formatEffect(effect: CardEffect): string {
  switch (effect.kind) {
    case "damage":
      return `${targetLabel(effect.target)}에게 피해 ${effect.amount}`;
    case "shield":
      return `${targetLabel(effect.target)} 잠수력 +${effect.amount}`;
    case "depthChange":
      return `${targetLabel(effect.target)} 수심 ${effect.amount >= 0 ? "+" : ""}${effect.amount}`;
    case "statusEffect":
      return `${targetLabel(effect.target)}에게 ${STATUS_EFFECT_LABELS[effect.status]} ${effect.duration}턴 부여`;
    case "cancelNextEnemyAction":
      return "다음 적 행동 1회 취소";
  }
}

export function formatCardEffects(effects: readonly CardEffect[]): string {
  return effects.map((effect) => `- ${formatEffect(effect)}`).join("\n");
}
