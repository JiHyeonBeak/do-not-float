import Phaser from "phaser";
import { FONT_FAMILY } from "../config/Constants";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create(): void {
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
