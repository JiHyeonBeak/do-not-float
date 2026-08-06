import Phaser from "phaser";
import { FONT_FAMILY } from "../config/Constants";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  create(): void {
    this.add
      .text(640, 300, "Do Not Float", { fontSize: "48px", fontFamily: FONT_FAMILY })
      .setOrigin(0.5);

    const startText = this.add
      .text(640, 400, "시작하기", { fontSize: "24px", fontFamily: FONT_FAMILY })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startText.on("pointerdown", () => this.scene.start("Map"));

    const licenseText = this.add
      .text(640, 450, "라이선스", { fontSize: "18px", color: "#9fb8c8", fontFamily: FONT_FAMILY })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    licenseText.on("pointerdown", () => this.scene.start("License"));
  }
}
