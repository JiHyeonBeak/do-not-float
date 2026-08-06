import Phaser from "phaser";
import { Card } from "../cards/Card";
import { CardView } from "./CardView";

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

  shakeCard(cardId: string): void {
    this.cardViews.find((view) => view.card.id === cardId)?.shake();
  }

  setSelected(cardId: string | null): void {
    this.cardViews.forEach((view) => view.setSelected(view.card.id === cardId));
  }

  render(hand: readonly Card[]): void {
    this.cardViews.forEach((view) => view.destroy());
    this.cardViews = hand.map(
      (card, index) =>
        new CardView(
          this.scene,
          index * 130,
          0,
          card,
          this.onCardClicked,
          this.onCardDoubleClicked
        )
    );
    this.add(this.cardViews);
  }
}
