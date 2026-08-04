import { CardType, CardEffect } from "./Card";

// 플레이어의 Card와 동작 방식(CardEffect)은 완전히 공유하되, "히든 카드" 같은
// 플레이어 전용 개념 없이 어떤 적이 쓰는 카드인지(enemyId)만 추가로 가진다.
export interface EnemyCard {
  id: string;
  name: string;
  type: CardType;
  description: string;
  enemyId: string; // data/enemies.json의 적 id와 대응
  effects: CardEffect[];
}
