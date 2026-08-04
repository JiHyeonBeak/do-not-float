import Phaser from "phaser";

export class MapScene extends Phaser.Scene {
  constructor() {
    super("Map");
  }

  create(): void {
    // TODO: RunManager 기준으로 지역 노드 표시, 선택 시 Battle로 이동
    this.scene.start("Battle");
  }
}
