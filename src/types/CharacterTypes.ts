export interface Stats {
  depth: number;
  divePower: number;
}

export type StatusEffectType = "attackDown" | "stunned" | "poison";

export interface StatusEffect {
  type: StatusEffectType;
  amount: number;
  remainingTurns: number;
}
