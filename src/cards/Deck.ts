// id만 있으면 어떤 카드 형태든(Card, EnemyCard ...) 다룰 수 있는 범용 덱.
// 뽑기/사용/버림더미 재셔플 로직은 카드 종류와 무관하게 동일하다.
export class Deck<T extends { id: string }> {
  private drawPile: T[];
  private discardPile: T[] = [];
  private hand: T[] = [];

  constructor(cards: T[]) {
    this.drawPile = this.shuffle([...cards]);
  }

  draw(count: number): T[] {
    const drawn: T[] = [];
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0) this.reshuffleDiscardIntoDraw();
      const card = this.drawPile.pop();
      if (card) drawn.push(card);
    }
    this.hand.push(...drawn);
    return drawn;
  }

  // id가 아니라 카드 인스턴스(객체 참조)로 찾는다. 손패에 같은 id의 카드가 여러 장 있을 수
  // 있어서(예: 창 카드 2장) id로 찾으면 항상 먼저 나온 쪽만 걸려 사용자가 고른 것과 어긋난다.
  playFromHand(card: T): T | undefined {
    const index = this.hand.indexOf(card);
    if (index === -1) return undefined;
    const [played] = this.hand.splice(index, 1);
    this.discardPile.push(played);
    return played;
  }

  getHand(): readonly T[] {
    return this.hand;
  }

  // 현재 손패(아직 사용하지 않은 카드)를 뽑을 더미로 되돌리고 다시 섞은 뒤 새로 뽑는다.
  // 이미 사용(버림더미로 이동)된 카드는 대상에서 제외된다.
  reshuffleHand(count: number): T[] {
    this.drawPile.push(...this.hand);
    this.hand = [];
    this.drawPile = this.shuffle(this.drawPile);
    return this.draw(count);
  }

  private reshuffleDiscardIntoDraw(): void {
    this.drawPile = this.shuffle(this.discardPile);
    this.discardPile = [];
  }

  private shuffle(cards: T[]): T[] {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  }
}
