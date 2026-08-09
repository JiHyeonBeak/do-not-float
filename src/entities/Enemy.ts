import { Character } from "./Character";
import { Stats } from "../types/CharacterTypes";
import { CardType } from "../cards/Card";
import { EnemyCard } from "../cards/EnemyCard";
import { EnemyCardDatabase } from "../cards/EnemyCardDatabase";
import { Deck } from "../cards/Deck";
import { CardEffectRegistry, EffectContext } from "../cards/effects/CardEffectRegistry";
import { HAND_SIZE } from "../config/Constants";

export abstract class Enemy extends Character {
  abstract readonly id: string; // EnemyCardDatabase의 enemyId와 대응
  abstract readonly name: string;
  // 스프라이트 아트가 아직 없는 적은 이 값들을 비워두면 DepthTrack이 원(circle) 토큰으로 대신 표시한다.
  readonly spriteKey?: string; // 평상시(유영) 스프라이트시트 텍스처 키
  readonly idleAnimKey?: string;
  readonly attackAnimKey?: string; // attack/special 카드 사용 시 재생할 애니메이션 키
  readonly bgmKey?: string; // 이 적과의 전투 중 반복 재생할 BGM. 없으면 BattleScene이 BGM을 틀지 않는다.
  // 이 적을 처치하면 플레이어에게 지급되는 히든 카드 id(cards.json의 hidden:true 카드).
  // 없으면 아무 카드도 지급하지 않는다.
  readonly rewardCardId?: string;

  private deck?: Deck<EnemyCard>;

  constructor(stats: Stats) {
    super(stats);
  }

  // 자신의 카드 덱(손패)에서만 카드를 골라 사용하고, 실제로 사용된 카드를 돌려준다
  // (호출 쪽에서 로그/UI에 활용). 손패를 다 쓰면 자동으로 다시 채운다.
  // preferredType을 주면 손패 중 그 타입을 우선 고르고(예: "attack" 결정 시 실제로 공격 카드가
  // 나가도록), 손패에 그 타입이 하나도 없으면 손패 전체에서 무작위로 고르는 것으로 폴백한다.
  useSkill(ctx: EffectContext, preferredType?: CardType): EnemyCard {
    const deck = this.getDeck();
    if (deck.getHand().length === 0) deck.draw(HAND_SIZE);

    const hand = deck.getHand();
    const matchingHand = preferredType ? hand.filter((card) => card.type === preferredType) : [];
    const pool = matchingHand.length > 0 ? matchingHand : hand;

    const chosen = pool[Math.floor(Math.random() * pool.length)];
    const played = deck.playFromHand(chosen);
    if (!played) throw new Error(`Enemy "${this.id}" has no playable card`);

    played.effects.forEach((effect) => CardEffectRegistry.resolve(effect, ctx));
    return played;
  }

  // this.id는 서브클래스의 클래스 필드로 설정되며, 그 필드 초기화는 이 클래스(부모)의
  // 생성자가 끝난 뒤에 이뤄지므로 덱은 생성자가 아니라 첫 사용 시점에 지연 생성한다.
  private getDeck(): Deck<EnemyCard> {
    if (!this.deck) this.deck = new Deck(EnemyCardDatabase.getByEnemyId(this.id).slice());
    return this.deck;
  }
}
