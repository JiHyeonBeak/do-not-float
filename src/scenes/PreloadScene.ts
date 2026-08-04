import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("Preload");
  }

  preload(): void {
    // TODO: AssetKeys 기준으로 이미지/오디오 전체 로드 + 로딩바 표시
  }

  create(): void {
    this.scene.start("MainMenu");
  }
}
