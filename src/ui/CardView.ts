import Phaser from "phaser";
import { Card } from "../cards/Card";

const DEFAULT_STROKE = { width: 2, color: 0xffffff };
const SELECTED_STROKE = { width: 4, color: 0xffd23f };

export class CardView extends Phaser.GameObjects.Container {
  readonly card: Card;
  private background: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    card: Card,
    onClick?: (card: Card) => void
  ) {
    super(scene, x, y);
    this.card = card;

    this.background = scene.add
      .rectangle(0, 0, 120, 160, 0x0d3b57)
      .setStrokeStyle(DEFAULT_STROKE.width, DEFAULT_STROKE.color);
    const nameText = scene.add.text(-50, -70, card.name, { fontSize: "12px" });

    this.background.setInteractive({ useHandCursor: true });
    if (onClick) this.background.on("pointerdown", () => onClick(card));

    this.add([this.background, nameText]);
    scene.add.existing(this);
  }

  setSelected(selected: boolean): void {
    const stroke = selected ? SELECTED_STROKE : DEFAULT_STROKE;
    this.background.setStrokeStyle(stroke.width, stroke.color);
  }

  shake(): void {
    this.scene.tweens.add({
      targets: this,
      angle: { from: -6, to: 6 },
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => this.setAngle(0),
    });
  }
}
