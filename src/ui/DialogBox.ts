import Phaser from "phaser";

const DISPLAY_DURATION_MS = 2200;
const FADE_DURATION_MS = 300;
const BOX_WIDTH = 480;
const BOX_HEIGHT = 70;

// 카드 설명을 잠깐 띄웠다가 자동으로 사라지는 안내창.
export class DialogBox extends Phaser.GameObjects.Container {
  private text: Phaser.GameObjects.Text;
  private hideTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const background = scene.add
      .rectangle(0, 0, BOX_WIDTH, BOX_HEIGHT, 0x0d3b57, 0.9)
      .setStrokeStyle(2, 0xffffff);
    this.text = scene.add
      .text(0, 0, "", {
        fontSize: "16px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: BOX_WIDTH - 32 },
      })
      .setOrigin(0.5);

    this.add([background, this.text]);
    scene.add.existing(this);
    this.setAlpha(0);
  }

  show(message: string): void {
    this.text.setText(message);
    this.hideTimer?.remove();
    this.scene.tweens.killTweensOf(this);
    this.setAlpha(1);

    this.hideTimer = this.scene.time.delayedCall(DISPLAY_DURATION_MS, () => {
      this.scene.tweens.add({ targets: this, alpha: 0, duration: FADE_DURATION_MS });
    });
  }
}
