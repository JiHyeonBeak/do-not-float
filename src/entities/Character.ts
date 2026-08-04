import { Stats, StatusEffect } from "../types/CharacterTypes";
import { DEPTH_MAX } from "../config/Constants";

export abstract class Character {
  protected depth: number;
  protected divePower: number;
  protected statusEffects: StatusEffect[] = [];

  constructor(stats: Stats) {
    this.depth = stats.depth;
    this.divePower = stats.divePower;
  }

  getDepth(): number {
    return this.depth;
  }

  getDivePower(): number {
    return this.divePower;
  }

  isSurfaced(): boolean {
    return this.depth <= 0;
  }

  applyDamage(amount: number): number {
    const mitigated = Math.max(0, amount - this.divePower);
    this.depth = Math.max(0, this.depth - mitigated);
    return mitigated;
  }

  changeDepth(amount: number): void {
    this.depth = Math.min(DEPTH_MAX, Math.max(0, this.depth + amount));
  }

  changeDivePower(amount: number): void {
    this.divePower = Math.max(0, this.divePower + amount);
  }

  addStatusEffect(effect: StatusEffect): void {
    this.statusEffects.push(effect);
  }

  getStatusEffects(): readonly StatusEffect[] {
    return this.statusEffects;
  }
}
