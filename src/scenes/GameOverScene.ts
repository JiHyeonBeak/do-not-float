import Phaser from "phaser";
import { FONT_FAMILY } from "../config/Constants";
import { AssetKeys } from "../utils/AssetKeys";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create(): void {
    // 노을진 해수면 배경 3겹: 정적 베이스 위에 애니메이션 레이어 2겹(전체 장면, 수면 반짝임)을
    // 겹쳐 재생한다. layer2는 불투명이라 static을 덮으므로 먼저 깔고, layer1은 하늘이 투명하고
    // 수면만 반짝이는 레이어라 맨 위에 올려야 반짝임이 보인다.
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add
      .image(centerX, centerY, AssetKeys.images.backgroundGameOver)
      .setDisplaySize(this.scale.width, this.scale.height);

    this.add
      .sprite(centerX, centerY, AssetKeys.images.backgroundGameOverLayer2)
      .setDisplaySize(this.scale.width, this.scale.height)
      .play(AssetKeys.animations.backgroundGameOverLayer2Ambient);

    this.add
      .sprite(centerX, centerY, AssetKeys.images.backgroundGameOverLayer1)
      .setDisplaySize(this.scale.width, this.scale.height)
      .play(AssetKeys.animations.backgroundGameOverLayer1Ambient);

    // 배경이 밝아서 텍스트 가독성이 떨어지므로, 반투명 패널로 감싸서 배경과 분리한다.
    this.add.rectangle(640, 410, 480, 190, 0x000000, 0.55);

    this.add
      .text(640, 360, "수면에 도달했습니다...", { fontSize: "32px", fontFamily: FONT_FAMILY })
      .setOrigin(0.5);

    const restartText = this.add
      .text(640, 460, "처음으로", { fontSize: "24px", fontFamily: FONT_FAMILY })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    restartText.on("pointerdown", () => this.scene.start("MainMenu"));
  }
}
