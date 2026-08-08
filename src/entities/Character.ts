import { Stats, StatusEffect } from "../types/CharacterTypes";
import { DEPTH_MAX, MAX_STATUS_EFFECTS } from "../config/Constants";
import { StatusEffectRegistry } from "./statusEffects/StatusEffectRegistry";
import { EventBus, GameEvents } from "../utils/EventBus";

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
    const before = this.depth;
    const mitigated = Math.max(0, amount - this.divePower);
    this.depth = Math.max(0, this.depth - mitigated);
    this.emitDepthChangedIfDifferent(before);
    return mitigated;
  }

  changeDepth(amount: number): void {
    const before = this.depth;
    this.depth = Math.min(DEPTH_MAX, Math.max(0, this.depth + amount));
    this.emitDepthChangedIfDifferent(before);
  }

  // 실제로 수심이 바뀌었을 때만 알린다(예: 방어력에 완전히 막힌 피해나 이미 최대/최소 수심에서의
  // 시도는 눈에 보이는 변화가 없으므로 이펙트를 띄울 이유가 없다).
  private emitDepthChangedIfDifferent(before: number): void {
    if (this.depth !== before) {
      EventBus.emit(GameEvents.DepthChanged, this);
    }
  }

  changeDivePower(amount: number): void {
    this.divePower = Math.max(0, this.divePower + amount);
  }

  addStatusEffect(effect: StatusEffect): void {
    if (this.statusEffects.length >= MAX_STATUS_EFFECTS) return;
    this.statusEffects.push(effect);
  }

  getStatusEffects(): readonly StatusEffect[] {
    return this.statusEffects;
  }

  // stunned처럼 행동을 막는 상태이상이 하나라도 있으면 true. 어떤 상태이상이 행동을 막는지는
  // StatusEffectRegistry에 등록된 내용으로 결정되며, Character는 그 판단 방식을 모른다.
  isActionBlocked(): boolean {
    return this.statusEffects.some((effect) => StatusEffectRegistry.get(effect.type)?.blocksAction);
  }

  // attackDown처럼 공격력을 낮추는 상태이상들을 순서대로 적용한 최종 피해량을 계산한다.
  getOutgoingDamageModifier(amount: number): number {
    return this.statusEffects.reduce((current, effect) => {
      const modify = StatusEffectRegistry.get(effect.type)?.modifyOutgoingDamage;
      return modify ? modify(current, effect) : current;
    }, amount);
  }

  // 이 캐릭터의 턴이 시작될 때 호출된다: poison 같은 turn-start 효과를 먼저 발동시킨 뒤,
  // 남은 지속시간을 1턴 줄이고 0이 되면 제거한다. 이걸 아무도 호출하지 않으면 상태이상이
  // 영구 지속되는 것처럼 보인다.
  resolveTurnStartStatusEffects(): void {
    this.statusEffects.forEach((effect) => StatusEffectRegistry.get(effect.type)?.onTurnStart?.(this, effect));
    this.statusEffects = this.statusEffects
      .map((effect) => ({ ...effect, remainingTurns: effect.remainingTurns - 1 }))
      .filter((effect) => effect.remainingTurns > 0);
  }
}
