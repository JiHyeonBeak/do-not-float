import { Card } from "./Card";

export class Deck {
  private drawPile: Card[];
  private discardPile: Card[] = [];
  private hand: Card[] = [];

  constructor(cards: Card[]) {
    this.drawPile = this.shuffle([...cards]);
  }

  draw(count: number): Card[] {
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0) this.reshuffleDiscardIntoDraw();
      const card = this.drawPile.pop();
      if (card) drawn.push(card);
    }
    this.hand.push(...drawn);
    return drawn;
  }

  playFromHand(cardId: string): Card | undefined {
    const index = this.hand.findIndex((card) => card.id === cardId);
    if (index === -1) return undefined;
    const [card] = this.hand.splice(index, 1);
    this.discardPile.push(card);
    return card;
  }

  getHand(): readonly Card[] {
    return this.hand;
  }

  private reshuffleDiscardIntoDraw(): void {
    this.drawPile = this.shuffle(this.discardPile);
    this.discardPile = [];
  }

  private shuffle(cards: Card[]): Card[] {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  }
}
