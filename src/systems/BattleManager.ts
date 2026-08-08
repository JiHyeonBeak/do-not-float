import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Card } from "../cards/Card";
import { CardEffectResolver } from "../cards/CardEffectResolver";
import { getCardCost } from "../cards/CardCost";
import { TurnManager } from "./TurnManager";
import { EnemyAI } from "./EnemyAI";
import { RunManager } from "./RunManager";
import { BattleResult } from "../types/GameTypes";
import { EventBus, GameEvents } from "../utils/EventBus";

// 카드를 낼 수 없는 이유. 실제 안내 문구는 UI(BattleScene) 쪽에서 매핑한다.
export type CardBlockReason = "insufficientStamina" | "depthMax" | "staminaMax" | "stunned";

export class BattleManager {
  private turnManager = new TurnManager();

  constructor(private player: Player, private enemy: Enemy) {}

  canPlayCard(card: Card): boolean {
    return this.getBlockReason(card) === null;
  }

  getBlockReason(card: Card): CardBlockReason | null {
    if (this.player.isActionBlocked()) {
      return "stunned";
    }
    if (RunManager.getInstance().getStamina() < getCardCost(card.effects)) {
      return "insufficientStamina";
    }
    // canPlay는 효과 중 하나라도 유효하면 통과시킨다(예: 피해+스태미너 회복 카드는 스태미너가
    // 최대치라도 피해 효과가 유효하니 낼 수 있다). 그래서 여기 도달했다는 건 카드의 모든 효과가
    // 전부 막혀 실질적으로 아무 일도 안 일어난다는 뜻이라, 그때만 구체적인 이유를 안내한다.
    if (CardEffectResolver.canPlay(card, this.player, this.enemy)) {
      return null;
    }
    const isBlockedByStaminaCap = card.effects.some(
      (effect) => effect.kind === "stamina" && effect.amount > 0
    );
    return isBlockedByStaminaCap ? "staminaMax" : "depthMax";
  }

  playCard(card: Card): void {
    console.log(`[Card] ${card.name} 사용`, card.effects);
    CardEffectResolver.resolve(card, this.player, this.enemy);
    RunManager.getInstance().spendStamina(getCardCost(card.effects));
    EventBus.emit(GameEvents.CardPlayed, card);
    this.checkBattleEnd();
  }

  endPlayerTurn(): void {
    this.turnManager.endPlayerTurn();
    this.runEnemyTurn();
  }

  private runEnemyTurn(): void {
    // stunned 여부는 이번 턴의 상태이상이 tick으로 사라지기 전에 확인해야 한다.
    const isEnemyBlocked = this.enemy.isActionBlocked();
    // 적 턴이 시작되는 시점이므로 poison 등 turn-start 효과를 발동시키고 남은 턴을 줄인다.
    this.enemy.resolveTurnStartStatusEffects();

    if (isEnemyBlocked) {
      console.log(`[Enemy] ${this.enemy.name} 상태이상으로 행동 불가`);
    } else {
      const decision = EnemyAI.decide(this.enemy, this.player);
      console.log(`[Enemy] ${this.enemy.name} 행동 선택: ${decision}`);

      // decision은 항상 구체적인 행동(공격/방어/잠수/특수)이므로 매 턴 반드시 그에 맞는 카드를 낸다.
      const playedCard = this.enemy.useSkill({ source: this.enemy, target: this.player }, decision);
      console.log(`[Enemy] ${this.enemy.name} 카드 사용: ${playedCard.name}`, playedCard.effects);
      EventBus.emit(GameEvents.CardPlayed, playedCard);
      EventBus.emit(GameEvents.EnemyCardPlayed, playedCard);
    }

    this.checkBattleEnd();
    this.turnManager.endEnemyTurn();

    // 다시 플레이어 턴이 시작되는 시점이므로 플레이어의 turn-start 효과를 발동시키고 남은 턴을 줄인다.
    this.player.resolveTurnStartStatusEffects();
  }

  private checkBattleEnd(): void {
    if (this.player.isSurfaced() || this.enemy.isSurfaced()) {
      const result: BattleResult = this.player.isSurfaced() ? "defeat" : "victory";
      this.turnManager.endBattle();
      EventBus.emit(GameEvents.BattleEnded, result);
    }
  }
}
