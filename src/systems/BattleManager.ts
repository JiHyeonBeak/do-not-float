import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Card } from "../cards/Card";
import { CardEffectResolver } from "../cards/CardEffectResolver";
import { TurnManager } from "./TurnManager";
import { EnemyAI } from "./EnemyAI";
import { BattleResult } from "../types/GameTypes";
import { EventBus, GameEvents } from "../utils/EventBus";

export class BattleManager {
  private turnManager = new TurnManager();

  constructor(private player: Player, private enemy: Enemy) {}

  canPlayCard(card: Card): boolean {
    return CardEffectResolver.canPlay(card, this.player, this.enemy);
  }

  playCard(card: Card): void {
    console.log(`[Card] ${card.name} 사용`, card.effects);
    CardEffectResolver.resolve(card, this.player, this.enemy);
    EventBus.emit(GameEvents.CardPlayed, card);
    this.checkBattleEnd();
  }

  endPlayerTurn(): void {
    this.turnManager.endPlayerTurn();
    this.runEnemyTurn();
  }

  private runEnemyTurn(): void {
    const decision = EnemyAI.decide(this.enemy, this.player);
    console.log(`[Enemy] ${this.enemy.name} 행동 선택: ${decision}`);

    if (decision === "attack") {
      const playedCard = this.enemy.useSkill({ source: this.enemy, target: this.player });
      console.log(`[Enemy] ${this.enemy.name} 카드 사용: ${playedCard.name}`, playedCard.effects);
      EventBus.emit(GameEvents.CardPlayed, playedCard);
    }

    this.checkBattleEnd();
    this.turnManager.endEnemyTurn();
  }

  private checkBattleEnd(): void {
    if (this.player.isSurfaced() || this.enemy.isSurfaced()) {
      const result: BattleResult = this.player.isSurfaced() ? "defeat" : "victory";
      this.turnManager.endBattle();
      EventBus.emit(GameEvents.BattleEnded, result);
    }
  }
}
