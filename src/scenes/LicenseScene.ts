import Phaser from "phaser";
import { FONT_FAMILY } from "../config/Constants";

const LICENSE_TEXT = [
  "Copyright © 2017-2024, Eunbin Jeong (Dalgona.) <project-neodgm@dalgona.dev>",
  'with reserved font name "Neo둥근모" and "NeoDunggeunmo".',
].join("\n");

export class LicenseScene extends Phaser.Scene {
  constructor() {
    super("License");
  }

  create(): void {
    this.add
      .text(640, 200, "라이선스", { fontSize: "32px", fontFamily: FONT_FAMILY })
      .setOrigin(0.5);

    this.add
      .text(640, 320, LICENSE_TEXT, {
        fontSize: "16px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: 900 },
        fontFamily: FONT_FAMILY,
      })
      .setOrigin(0.5);

    const backText = this.add
      .text(640, 500, "뒤로가기", { fontSize: "20px", fontFamily: FONT_FAMILY })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backText.on("pointerdown", () => this.scene.start("MainMenu"));
  }
}
