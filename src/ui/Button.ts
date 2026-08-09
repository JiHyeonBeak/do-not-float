import Phaser from "phaser";
import { FONT_FAMILY } from "../config/Constants";
import { AssetKeys } from "../utils/AssetKeys";

export const BUTTON_WIDTH = 200;
export const BUTTON_HEIGHT = 50; // button.png 원본(1418x351)과 같은 비율.

const LABEL_COLOR = "#0a1440";

// button.png 프레임 위에 라벨 텍스트를 겹쳐 그리는 범용 버튼. 텍스트 버튼을 쓰던 자리를
// 그대로 대체할 수 있도록 텍스트/클릭 콜백만 받는다(전투 화면의 재셔플/카드 뽑기/턴 종료 등).
export class Button extends Phaser.GameObjects.Container {
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, onClick: () => void) {
    super(scene, x, y);

    const background = scene.add
      .image(0, 0, AssetKeys.images.button)
      .setDisplaySize(BUTTON_WIDTH, BUTTON_HEIGHT)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", onClick);

    this.label = scene.add
      .text(0, 0, text, { fontSize: "18px", fontFamily: FONT_FAMILY, color: LABEL_COLOR })
      .setOrigin(0.5);

    this.add([background, this.label]);
    scene.add.existing(this);
  }

  setText(text: string): void {
    this.label.setText(text);
  }
}
