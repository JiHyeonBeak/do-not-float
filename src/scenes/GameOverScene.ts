import Phaser from "phaser";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create(): void {
    this.add.text(640, 360, "수면에 도달했습니다...", { fontSize: "32px" }).setOrigin(0.5);
  }
}
