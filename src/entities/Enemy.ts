import { Character } from "./Character";
import { Stats } from "../types/CharacterTypes";
import { EnemyCard } from "../cards/EnemyCard";
import { EnemyCardDatabase } from "../cards/EnemyCardDatabase";
import { CardEffectRegistry, EffectContext } from "../cards/effects/CardEffectRegistry";

export abstract class Enemy extends Character {
  abstract readonly id: string; // EnemyCardDatabase의 enemyId와 대응
  abstract readonly name: string;

  constructor(stats: Stats) {
    super(stats);
  }

  // 자신의 카드 덱(EnemyCardDatabase.getByEnemyId)에서 한 장을 뽑아 사용하고,
  // 실제로 사용된 카드를 돌려준다 (호출 쪽에서 로그/UI에 활용).
  useSkill(ctx: EffectContext): EnemyCard {
    const cards = EnemyCardDatabase.getByEnemyId(this.id);
    if (cards.length === 0) throw new Error(`No enemy cards found for enemyId: ${this.id}`);

    const card = cards[Math.floor(Math.random() * cards.length)];
    card.effects.forEach((effect) => CardEffectRegistry.resolve(effect, ctx));
    return card;
  }
}
