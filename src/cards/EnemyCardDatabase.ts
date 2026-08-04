import { EnemyCard } from "./EnemyCard";
import enemyCardsData from "../data/enemyCards.json";
import { validateCard } from "./CardValidation";

const ENEMY_CARDS: EnemyCard[] = enemyCardsData as EnemyCard[];

function validateEnemyCard(card: EnemyCard): void {
  validateCard(card);
  if (!card.enemyId) throw new Error(`Enemy card "${card.id}" is missing enemyId`);
}

// main.ts가 이펙트 핸들러를 먼저 등록하므로 이 시점엔 레지스트리가 채워져 있다.
ENEMY_CARDS.forEach(validateEnemyCard);

export class EnemyCardDatabase {
  private static byId = new Map(ENEMY_CARDS.map((card) => [card.id, card]));

  static getAll(): readonly EnemyCard[] {
    return ENEMY_CARDS;
  }

  static getByEnemyId(enemyId: string): readonly EnemyCard[] {
    return ENEMY_CARDS.filter((card) => card.enemyId === enemyId);
  }

  static getById(id: string): EnemyCard {
    const card = this.byId.get(id);
    if (!card) throw new Error(`Unknown enemy card id: ${id}`);
    return card;
  }
}
