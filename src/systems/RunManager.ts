import { Card } from "../cards/Card";
import { PLAYER_MAX_STAMINA, MAX_RESHUFFLES_PER_STAGE } from "../config/Constants";

export class RunManager {
  private static instance: RunManager;

  private currentRegion = 0;
  private ownedCards: Card[] = [];
  // 전투(Player 인스턴스)가 아니라 런 전체에 귀속되는 자원이라 여기서 관리한다.
  // Player는 전투가 시작될 때마다 새로 생성되므로 스태미나를 Player에 두면
  // "다음 스테이지 이동 전까지 유지"라는 규칙이 깨진다.
  private stamina = PLAYER_MAX_STAMINA;
  private remainingReshuffles = MAX_RESHUFFLES_PER_STAGE;

  static getInstance(): RunManager {
    if (!this.instance) this.instance = new RunManager();
    return this.instance;
  }

  private constructor() {}

  getCurrentRegion(): number {
    return this.currentRegion;
  }

  advanceRegion(): void {
    this.currentRegion += 1;
    this.stamina = PLAYER_MAX_STAMINA;
    this.remainingReshuffles = MAX_RESHUFFLES_PER_STAGE;
  }

  addCard(card: Card): void {
    this.ownedCards.push(card);
  }

  getOwnedCards(): readonly Card[] {
    return this.ownedCards;
  }

  getStamina(): number {
    return this.stamina;
  }

  spendStamina(amount: number): void {
    this.stamina = Math.max(0, this.stamina - amount);
  }

  // 추후 특정 카드 효과로 스태미나 일부를 회복시킬 때 사용할 진입점.
  restoreStamina(amount: number): void {
    this.stamina = Math.min(PLAYER_MAX_STAMINA, this.stamina + amount);
  }

  getRemainingReshuffles(): number {
    return this.remainingReshuffles;
  }

  useReshuffle(): void {
    this.remainingReshuffles = Math.max(0, this.remainingReshuffles - 1);
  }

  reset(): void {
    this.currentRegion = 0;
    this.ownedCards = [];
    this.stamina = PLAYER_MAX_STAMINA;
    this.remainingReshuffles = MAX_RESHUFFLES_PER_STAGE;
  }
}
