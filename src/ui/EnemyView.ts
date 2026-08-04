import Phaser from "phaser";
import { Enemy } from "../entities/Enemy";
import { DepthGauge } from "./DepthGauge";
import { DivePowerGauge } from "./DivePowerGauge";

// 적의 이름/수심/잠수력을 한눈에 보여주는 HUD. 자리표시용 사각형은
// 나중에 실제 적 스프라이트로 교체될 자리를 잡아 둔 것뿐이다.
export class EnemyView extends Phaser.GameObjects.Container {
  private depthGauge: DepthGauge;
  private divePowerGauge: DivePowerGauge;

  constructor(scene: Phaser.Scene, x: number, y: number, private enemy: Enemy) {
    super(scene, x, y);

    const nameText = scene.add.text(0, 0, enemy.name, { fontSize: "18px", color: "#ff8080" });
    this.depthGauge = new DepthGauge(scene, 0, 60);
    this.divePowerGauge = new DivePowerGauge(scene, 0, 95);
    const sprite = scene.add
      .rectangle(0, 200, 100, 100, 0x5a1a1a)
      .setStrokeStyle(2, 0xff8080)
      .setOrigin(0, 0.5);

    this.add([nameText, this.depthGauge, this.divePowerGauge, sprite]);
    scene.add.existing(this);

    this.refresh();
  }

  refresh(): void {
    this.depthGauge.updateDepth(this.enemy.getDepth());
    this.divePowerGauge.setDivePower(this.enemy.getDivePower());
  }
}
