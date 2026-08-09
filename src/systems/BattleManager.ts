import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Card } from "../cards/Card";
import { CardEffectResolver } from "../cards/CardEffectResolver";
import { CardDatabase } from "../cards/CardDatabase";
import { getCardCost } from "../cards/CardCost";
import { TurnManager } from "./TurnManager";
import { EnemyAI } from "./EnemyAI";
import { RunManager } from "./RunManager";
import { BattleResult } from "../types/GameTypes";
import { EventBus, GameEvents } from "../utils/EventBus";
import { STAMINA_REGEN_INTERVAL_TURNS, STAMINA_REGEN_AMOUNT } from "../config/Constants";

// 카드를 낼 수 없는 이유. 실제 안내 문구는 UI(BattleScene) 쪽에서 매핑한다.
export type CardBlockReason =
  | "insufficientStamina"
  | "depthMax"
  | "staminaMax"
  | "stunned"
  | "noDebuffToCancel";

export class BattleManager {
  private turnManager = new TurnManager();
  // 전투 시작 시점이 플레이어의 1번째 턴이므로 1부터 센다.
  private playerTurnNumber = 1;
  // 이번 전투 승리로 새로 지급된 히든 카드(있다면). 보상 화면(RewardScene)에서 무엇을
  // 얻었는지 보여줄 때 읽어간다. 지급된 게 없으면(적에게 보상이 없거나 이미 보유 중) undefined.
  private lastGrantedCard?: Card;

  constructor(private player: Player, private enemy: Enemy) {
    // 전투(=스테이지)가 시작되는 시점이므로, 엔딩 스태프롤에 보여줄 클리어 타임 측정을 시작한다.
    RunManager.getInstance().startStageTimer();
  }

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
    if (card.effects.some((effect) => effect.kind === "stamina" && effect.amount > 0)) {
      return "staminaMax";
    }
    if (card.effects.some((effect) => effect.kind === "cancelDebuff")) {
      return "noDebuffToCancel";
    }
    return "depthMax";
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

    this.turnManager.endEnemyTurn();

    // 다시 플레이어 턴이 시작되는 시점이므로 플레이어의 turn-start 효과를 발동시키고 남은 턴을 줄인다.
    this.player.resolveTurnStartStatusEffects();

    // 적의 행동뿐 아니라 방금 발동된 플레이어의 turn-start 효과(중독 등)만으로도 수심이 0이 될
    // 수 있으므로, 그 효과까지 전부 반영된 뒤에 승패를 확인해야 한다. 여기서 확인하지 않으면
    // 플레이어가 이미 죽은 채로 자기 턴을 맞이하고, 카드를 내거나 다음 적 턴이 끝날 때까지
    // 게임 오버 처리가 미뤄진다.
    this.checkBattleEnd();

    // 밸런스 패치: 플레이어 턴이 N번째로 돌아올 때마다 스태미너를 소량 자동 회복한다.
    this.playerTurnNumber += 1;
    if (this.playerTurnNumber % STAMINA_REGEN_INTERVAL_TURNS === 0) {
      RunManager.getInstance().restoreStamina(STAMINA_REGEN_AMOUNT);
      console.log(`[Battle] 플레이어 턴 ${this.playerTurnNumber}번째: 스태미너 ${STAMINA_REGEN_AMOUNT} 자동 회복`);
    }
  }

  private checkBattleEnd(): void {
    if (this.player.isSurfaced() || this.enemy.isSurfaced()) {
      const result: BattleResult = this.player.isSurfaced() ? "defeat" : "victory";
      if (result === "victory") {
        this.grantEnemyRewardCard();
        RunManager.getInstance().recordStageClear(this.enemy.id);
      }
      this.turnManager.endBattle();
      EventBus.emit(GameEvents.BattleEnded, result);
    }
  }

  getLastGrantedCard(): Card | undefined {
    return this.lastGrantedCard;
  }

  // 적마다 정해진 히든 카드(Enemy.rewardCardId)를 처치 시 1회 지급한다. 이미 갖고 있으면
  // 아무 일도 하지 않는다(checkBattleEnd가 승리 판정 후 한 번 더 호출될 수 있어 방어적으로 확인).
  private grantEnemyRewardCard(): void {
    const rewardCardId = this.enemy.rewardCardId;
    if (!rewardCardId) return;

    const runManager = RunManager.getInstance();
    const alreadyOwned = runManager.getOwnedCards().some((card) => card.id === rewardCardId);
    if (alreadyOwned) return;

    const card = CardDatabase.getById(rewardCardId);
    runManager.addCard(card);
    this.lastGrantedCard = card;
  }
}
