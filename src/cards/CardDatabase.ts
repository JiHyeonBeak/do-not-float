import { Card } from "./Card";
import cardsData from "../data/cards.json";
import { validateCard } from "./CardValidation";

const CARDS: Card[] = cardsData as Card[];

// main.ts가 이펙트 핸들러를 먼저 등록하므로 이 시점엔 레지스트리가 채워져 있다.
CARDS.forEach(validateCard);

export class CardDatabase {
  private static byId = new Map(CARDS.map((card) => [card.id, card]));

  static getAll(): readonly Card[] {
    return CARDS;
  }

  static getById(id: string): Card {
    const card = this.byId.get(id);
    if (!card) throw new Error(`Unknown card id: ${id}`);
    return card;
  }
}
