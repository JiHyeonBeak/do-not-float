import Phaser from "phaser";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  create(): void {
    this.add.text(640, 300, "Do Not Float", { fontSize: "48px" }).setOrigin(0.5);

    const startText = this.add
      .text(640, 400, "시작하기", { fontSize: "24px" })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startText.on("pointerdown", () => this.scene.start("Map"));
  }
}
