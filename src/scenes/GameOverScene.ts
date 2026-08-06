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
  }
}
