import Phaser from "phaser";
import { Card } from "../cards/Card";
import { FONT_FAMILY } from "../config/Constants";

const DEFAULT_STROKE = { width: 2, color: 0xffffff };
const SELECTED_STROKE = { width: 4, color: 0xffd23f };
const DOUBLE_CLICK_THRESHOLD_MS = 300;

export class CardView extends Phaser.GameObjects.Container {
  readonly card: Card;
  private background: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    card: Card,
    onClick?: (card: Card) => void,
    onDoubleClick?: (card: Card) => void
  ) {
    super(scene, x, y);
    this.card = card;

    this.background = scene.add
      .rectangle(0, 0, 120, 160, 0x0d3b57)
      .setStrokeStyle(DEFAULT_STROKE.width, DEFAULT_STROKE.color);
    const nameText = scene.add.text(-50, -70, card.name, {
      fontSize: "12px",
      fontFamily: FONT_FAMILY,
    });

    this.background.setInteractive({ useHandCursor: true });

    // 짧은 시간 안에 두 번 클릭되면 더블클릭으로 취급한다 (선택 + 즉시 사용).
    let lastClickTime = 0;
    this.background.on("pointerdown", () => {
      const now = scene.time.now;
      if (onDoubleClick && now - lastClickTime < DOUBLE_CLICK_THRESHOLD_MS) {
        lastClickTime = 0;
        onDoubleClick(card);
      } else {
        lastClickTime = now;
        onClick?.(card);
      }
    });

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
