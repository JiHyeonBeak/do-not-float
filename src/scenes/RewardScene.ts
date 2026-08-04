import Phaser from "phaser";
import { RunManager } from "../systems/RunManager";

export class RewardScene extends Phaser.Scene {
  constructor() {
    super("Reward");
  }

  create(): void {
    // TODO: 카드 획득 / 강화 / 최대 잠수력 증가 중 선택 UI
    RunManager.getInstance().advanceRegion();
    this.scene.start("Map");
  }
}
