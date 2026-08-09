import Phaser from "phaser";
import { Card } from "../cards/Card";
import { CardView, CARD_WIDTH } from "./CardView";

const CARD_SPACING = CARD_WIDTH + 20;

export class HandView extends Phaser.GameObjects.Container {
  private cardViews: CardView[] = [];
  private onCardClicked?: (card: Card) => void;
  private onCardDoubleClicked?: (card: Card) => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    onCardClicked?: (card: Card) => void,
    onCardDoubleClicked?: (card: Card) => void
  ) {
    super(scene, x, y);
    this.onCardClicked = onCardClicked;
    this.onCardDoubleClicked = onCardDoubleClicked;
    scene.add.existing(this);
  }

  // 손패에 같은 id의 카드가 여러 장 있을 수 있어(예: 창 카드 2장), id가 아니라 카드
  // 인스턴스(객체 참조) 기준으로 비교해야 정확히 그 카드 한 장만 선택/흔들림 처리된다.
  shakeCard(card: Card): void {
    this.cardViews.find((view) => view.card === card)?.shake();
  }

  setSelected(card: Card | null): void {
    this.cardViews.forEach((view) => view.setSelected(view.card === card));
  }

  render(hand: readonly Card[]): void {
    this.cardViews.forEach((view) => view.destroy());
    this.cardViews = hand.map(
      (card, index) =>
        new CardView(
          this.scene,
          index * CARD_SPACING,
          0,
          card,
          this.onCardClicked,
          this.onCardDoubleClicked
        )
    );
    this.add(this.cardViews);
  }
}
