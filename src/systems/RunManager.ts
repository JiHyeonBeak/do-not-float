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
  // 엔딩 스태프롤에서 스테이지별 클리어 타임을 보여주기 위한 기록. 전투가 시작될 때
  // startStageTimer(), 승리할 때 recordStageClear()를 호출해 채운다.
  private stageStartedAt?: number;
  private stageClearTimes: { enemyId: string; seconds: number }[] = [];

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

  startStageTimer(): void {
    this.stageStartedAt = Date.now();
  }

  // checkBattleEnd()가 승리 판정 후 방어적으로 두 번 호출될 수 있어, 타이머가 이미
  // 소비(undefined)된 상태면 아무 일도 하지 않는다(중복 기록 방지).
  recordStageClear(enemyId: string): void {
    if (this.stageStartedAt === undefined) return;
    const seconds = (Date.now() - this.stageStartedAt) / 1000;
    this.stageClearTimes.push({ enemyId, seconds });
    this.stageStartedAt = undefined;
  }

  getStageClearTimes(): readonly { enemyId: string; seconds: number }[] {
    return this.stageClearTimes;
  }

  reset(): void {
    this.currentRegion = 0;
    this.ownedCards = [];
    this.stamina = PLAYER_MAX_STAMINA;
    this.remainingReshuffles = MAX_RESHUFFLES_PER_STAGE;
    this.stageStartedAt = undefined;
    this.stageClearTimes = [];
  }
}
