import { CardEffect } from "./Card";
import { CardEffectRegistry } from "./effects/CardEffectRegistry";

// 플레이어 카드(Card)와 적 카드(EnemyCard)가 공통으로 가진 최소 형태.
// 두 데이터베이스가 같은 검증 로직을 공유하기 위한 구조적 타입이다.
interface ValidatableCard {
  id: string;
  name: string;
  effects: CardEffect[];
}

export function validateCard(card: ValidatableCard): void {
  if (!card.id || !card.name || !card.effects) {
    throw new Error(`Invalid card definition: ${JSON.stringify(card)}`);
  }
  card.effects.forEach((effect) => {
    if (!CardEffectRegistry.has(effect.kind)) {
      throw new Error(`Card "${card.id}" uses unregistered effect kind: "${effect.kind}"`);
    }
  });
}
