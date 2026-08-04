import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload(): void {
    // 로딩바 표시에 필요한 최소 에셋만 로드
  }

  create(): void {
    this.scene.start("Preload");
  }
}
