import Phaser from "phaser";
import { FONT_FAMILY } from "../config/Constants";

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super("Victory");
  }

  create(): void {
    this.add
      .text(640, 360, "바다의 균형을 되찾았습니다", { fontSize: "32px", fontFamily: FONT_FAMILY })
      .setOrigin(0.5);
  }
}
