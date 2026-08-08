import Phaser from "phaser";
import { FONT_FAMILY } from "../config/Constants";

const DISPLAY_DURATION_MS = 2200;
const FADE_DURATION_MS = 300;
const BOX_WIDTH = 520;
const BOX_HEIGHT = 150;
const TEXT_WRAP_WIDTH = 460;
const DEFAULT_FONT_SIZE = "16px";

// 카드 설명/효과를 보여주는 안내창. 내용 길이와 무관하게 항상 고정된 크기로 뜬다.
// show()는 잠깐 떴다가 자동으로 사라지고(카드 사용 알림),
// showPersistent()는 hide()를 부를 때까지 계속 떠 있는다(카드 선택 미리보기).
export class DialogBox extends Phaser.GameObjects.Container {
  private text: Phaser.GameObjects.Text;
  private hideTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const background = scene.add.rectangle(0, 0, BOX_WIDTH, BOX_HEIGHT, 0x000000, 0.55);
    this.text = scene.add
      .text(0, 0, "", {
        fontSize: "16px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: TEXT_WRAP_WIDTH },
        padding: { top: 4, bottom: 8 },
        fontFamily: FONT_FAMILY,
      })
      .setOrigin(0.5);

    this.add([background, this.text]);
    scene.add.existing(this);
    this.setAlpha(0);
  }

  show(message: string, fontSize: string = DEFAULT_FONT_SIZE): void {
    this.displayText(message, fontSize);
    this.hideTimer = this.scene.time.delayedCall(DISPLAY_DURATION_MS, () => this.fadeOut());
  }

  showPersistent(message: string, fontSize: string = DEFAULT_FONT_SIZE): void {
    this.displayText(message, fontSize);
  }

  hide(): void {
    this.hideTimer?.remove();
    this.fadeOut();
  }

  private displayText(message: string, fontSize: string): void {
    this.hideTimer?.remove();
    this.scene.tweens.killTweensOf(this);
    this.text.setFontSize(fontSize);
    this.text.setText(message);
    this.setAlpha(1);
  }

  private fadeOut(): void {
    this.scene.tweens.add({ targets: this, alpha: 0, duration: FADE_DURATION_MS });
  }
}
