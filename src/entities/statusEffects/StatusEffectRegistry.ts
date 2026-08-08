import { StatusEffect, StatusEffectType } from "../../types/CharacterTypes";
import { Character } from "../Character";

// 상태이상 종류(poison/attackDown/stunned...)마다 "무엇을 하는지"를 여기 등록해서 결정한다.
// Character/BattleManager는 상태이상 종류를 직접 알 필요 없이 이 레지스트리만 거쳐 동작하므로,
// 새 상태이상을 추가할 때도 등록 파일 하나만 늘리면 되고 기존 코드는 건드리지 않는다.
export interface StatusEffectBehavior {
  // 이 상태이상을 가진 캐릭터의 턴이 시작될 때 호출된다 (예: poison의 도트 피해).
  onTurnStart?: (character: Character, effect: StatusEffect) => void;
  // 이 상태이상을 가진 캐릭터가 피해를 줄 때 피해량을 보정한다 (예: attackDown).
  modifyOutgoingDamage?: (amount: number, effect: StatusEffect) => number;
  // true면 이 상태이상을 가진 캐릭터는 이번 턴에 카드를 사용할 수 없다 (예: stunned).
  blocksAction?: boolean;
}

export class StatusEffectRegistry {
  private static behaviors = new Map<StatusEffectType, StatusEffectBehavior>();

  static register(type: StatusEffectType, behavior: StatusEffectBehavior): void {
    this.behaviors.set(type, behavior);
  }

  static get(type: StatusEffectType): StatusEffectBehavior | undefined {
    return this.behaviors.get(type);
  }
}
