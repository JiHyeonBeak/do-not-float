import { StatusEffect, StatusEffectType } from "../types/CharacterTypes";

export const STATUS_EFFECT_LABELS: Record<StatusEffectType, string> = {
  attackDown: "공격력 감소",
  stunned: "기절",
  poison: "중독",
};

export function formatStatusEffects(effects: readonly StatusEffect[]): string {
  if (effects.length === 0) return "현재 효과: 없음";

  const lines = effects.map(
    (effect) => `- ${STATUS_EFFECT_LABELS[effect.type]} (${effect.remainingTurns}턴)`
  );
  return ["현재 효과", ...lines].join("\n");
}
